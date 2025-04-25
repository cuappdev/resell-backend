import { AbstractRepository, EntityRepository } from 'typeorm';

import { SearchModel } from '../models/SearchModel';
import { UserModel } from '../models/UserModel';
import { Uuid } from '../types';

@EntityRepository(SearchModel)
export class SearchRepository extends AbstractRepository<SearchModel> {
  /**
   * Get all searches
   */
  public async getAllSearches(): Promise<SearchModel[]> {
    return await this.repository
      .createQueryBuilder("search")
      .leftJoinAndSelect("search.user", "user")
      .getMany();
  }

  /**
   * Get a search by its ID
   */
  public async getSearchById(id: Uuid): Promise<SearchModel | undefined> {
    return await this.repository
      .createQueryBuilder("search")
      .leftJoinAndSelect("search.user", "user")
      .where("search.id = :id", { id })
      .getOne();
  }

  /**
   * Get all searches by a specific user
   */
  public async getSearchesByUserId(firebaseUid: string): Promise<SearchModel[]> {
    return await this.repository
      .createQueryBuilder("search")
      .leftJoinAndSelect("search.user", "user")
      .where("search.firebaseUid = :firebaseUid", { firebaseUid })
      .getMany();
  }

  /**
   * Create a new search record
   */
  public async createSearch(
    searchText: string,
    searchVector: string,
    firebaseUid: string
  ): Promise<SearchModel> {
    const search = new SearchModel();
    search.searchText = searchText;
    search.searchVector = searchVector;
    search.firebaseUid = firebaseUid;
    
    return await this.repository.save(search);
  }

  /**
   * Find similar searches based on vector similarity
   * Note: This requires raw SQL as TypeORM doesn't natively support pgvector operations
   */
  public async findSimilarSearches(
    searchVector: string,
    limit: number = 5
  ): Promise<SearchModel[]> {
    // Using raw query to leverage pgvector's similarity search
    // The vector data is passed as a string and converted in the query
    return await this.repository
      .createQueryBuilder("search")
      .leftJoinAndSelect("search.user", "user")
      .orderBy(`search.searchVector <-> '${searchVector}'`)
      .limit(limit)
      .getMany();
  }

  /**
   * Delete a search by ID
   */
  public async deleteSearch(search: SearchModel): Promise<SearchModel> {
    return await this.repository.remove(search);
  }

  /**
   * Delete all searches by a user
   */
  public async deleteUserSearches(firebaseUid: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .delete()
      .from(SearchModel)
      .where("firebaseUid = :firebaseUid", { firebaseUid })
      .execute();
  }

  public async searchSuggestions(
    searchText: string,
    limit: number = 5
  ): Promise<SearchModel[]> {
    return await this.repository
      .createQueryBuilder("search")
      .leftJoinAndSelect("search.user", "user")
      .where("search.searchText ILIKE :searchText", { searchText: `%${searchText}%` })
      .limit(limit)
      .getMany();
  }
}
