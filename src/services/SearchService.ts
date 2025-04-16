import { getCustomRepository } from "typeorm";
import { SearchRepository } from "../repositories/SearchRepository";
import { getLoadedModel } from "../utils/SentenceEncoder";
import { SearchModel } from "../models/SearchModel";

export class SearchService {
  private searchRepository: SearchRepository;

  constructor() {
    this.searchRepository = getCustomRepository(SearchRepository);
  }

  /**
   * Create a search record with vectorized text using Universal Sentence Encoder
   */
  public async createSearch(searchText: string, firebaseUid: string): Promise<SearchModel> {
    // Get the embedding model
    const model = await getLoadedModel();
    
    // Generate embedding for the search text
    const embedding = await model.embed([searchText]).then((embeddings: any) => {
      // Convert tensor to array
      const embeddingArray = embeddings.arraySync()[0];
      // Convert array to string for storage
      return JSON.stringify(embeddingArray);
    });

    // Create and save the search record
    return await this.searchRepository.createSearch(
      searchText,
      embedding,
      firebaseUid
    );
  }

  /**
   * Find similar searches based on text similarity
   */
  public async findSimilarSearches(searchText: string, limit: number = 5): Promise<SearchModel[]> {
    // Get the embedding model
    const model = await getLoadedModel();
    
    // Generate embedding for the search text
    const embedding = await model.embed([searchText]).then((embeddings: any) => {
      // Convert tensor to array
      const embeddingArray = embeddings.arraySync()[0];
      // Convert array to string for query
      return JSON.stringify(embeddingArray);
    });

    // Find similar searches using vector similarity
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
  public async getSearchesByUserId(firebaseUid: string): Promise<SearchModel[]> {
    return await this.searchRepository.getSearchesByUserId(firebaseUid);
  }

  /**
   * Delete a search by ID
   */
  public async deleteSearch(searchId: string): Promise<SearchModel | undefined> {
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
