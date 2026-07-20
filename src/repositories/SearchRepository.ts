import { AbstractRepository, EntityRepository } from "typeorm";

import { SearchModel } from "../models/SearchModel";
import { UserModel } from "../models/UserModel";
import { Uuid } from "../types";
import { parseEmbedding, topKByCosine } from "../utils/Knn";

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
  public async getSearchesByUserId(
    firebaseUid: string,
  ): Promise<SearchModel[]> {
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
    firebaseUid: string,
  ): Promise<SearchModel> {
    const search = new SearchModel();
    search.searchText = searchText;
    search.searchVector = searchVector;
    search.firebaseUid = firebaseUid;

    return await this.repository.save(search);
  }

  public async saveSearch(search: SearchModel): Promise<SearchModel> {
    return await this.repository.save(search);
  }

  /**
   * Exact KNN over search embeddings stored as JSON/float text (no pgvector).
   */
  public async findSimilarSearches(
    searchVector: string,
    limit = 5,
  ): Promise<SearchModel[]> {
    const query = parseEmbedding(searchVector);
    if (!query) {
      return [];
    }

    const candidates = await this.repository
      .createQueryBuilder("search")
      .leftJoinAndSelect("search.user", "user")
      .where("search.searchVector IS NOT NULL")
      .getMany();

    return topKByCosine(
      query,
      candidates.map((search) => ({
        embedding: parseEmbedding(search.searchVector) ?? [],
        value: search,
      })),
      limit,
    );
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
    limit = 5,
  ): Promise<SearchModel[]> {
    return await this.repository
      .createQueryBuilder("search")
      .leftJoinAndSelect("search.user", "user")
      .where("search.searchText ILIKE :searchText", {
        searchText: `%${searchText}%`,
      })
      .limit(limit)
      .getMany();
  }
}
