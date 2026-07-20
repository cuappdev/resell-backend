import { Service } from "typedi";
import { getCustomRepository } from "typeorm";
import { SearchRepository } from "../repositories/SearchRepository";
import { embedText } from "../utils/EmbeddingService";
import { SearchModel } from "../models/SearchModel";

@Service()
export class SearchService {
  private searchRepository: SearchRepository;

  constructor() {
    this.searchRepository = getCustomRepository(SearchRepository);
  }

  /**
   * Create a search record. Vectorization runs in the background so search
   * results are not blocked on OpenAI.
   */
  public async createSearch(
    searchText: string,
    firebaseUid: string,
  ): Promise<SearchModel> {
    const search = await this.searchRepository.createSearch(
      searchText,
      "[]",
      firebaseUid,
    );

    void this.finalizeSearchEmbedding(search.id, searchText);

    return search;
  }

  private async finalizeSearchEmbedding(
    searchId: string,
    searchText: string,
  ): Promise<void> {
    try {
      const vector = await embedText(searchText);
      if (!vector) return;

      const search = await this.searchRepository.getSearchById(searchId);
      if (!search) return;

      search.searchVector = JSON.stringify(vector);
      await this.searchRepository.saveSearch(search);
    } catch (error) {
      console.error("Error finalizing search embedding:", error);
    }
  }

  /**
   * Find similar searches based on text similarity
   */
  public async findSimilarSearches(
    searchText: string,
    limit = 5,
  ): Promise<SearchModel[]> {
    let embedding = "[]";

    try {
      const vector = await embedText(searchText);
      if (vector) {
        embedding = JSON.stringify(vector);
      }
    } catch (error) {
      console.error("Error computing similar search embedding:", error);
    }

    return await this.searchRepository.findSimilarSearches(embedding, limit);
  }

  /**
   * Get all searches
   */
  public async getAllSearches(): Promise<SearchModel[]> {
    return await this.searchRepository.getAllSearches();
  }

  /**
   * Get searches by user ID
   */
  public async getSearchesByUserId(
    firebaseUid: string,
  ): Promise<SearchModel[]> {
    return await this.searchRepository.getSearchesByUserId(firebaseUid);
  }

  /**
   * Delete a search by ID
   */
  public async deleteSearch(
    searchId: string,
  ): Promise<SearchModel | undefined> {
    const search = await this.searchRepository.getSearchById(searchId);
    if (!search) {
      return undefined;
    }
    return await this.searchRepository.deleteSearch(search);
  }

  /**
   * Delete all searches by a user
   */
  public async deleteUserSearches(firebaseUid: string): Promise<void> {
    await this.searchRepository.deleteUserSearches(firebaseUid);
  }
}
