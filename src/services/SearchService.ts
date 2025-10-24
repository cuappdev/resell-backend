import { Service } from "typedi";
import { getCustomRepository } from "typeorm";
import { SearchRepository } from "../repositories/SearchRepository";
import { getLoadedModel } from "../utils/SentenceEncoder";
import { SearchModel } from "../models/SearchModel";

@Service()
export class SearchService {
  private searchRepository: SearchRepository;

  constructor() {
    this.searchRepository = getCustomRepository(SearchRepository);
  }

  /**
   * Create a search record with vectorized text using Universal Sentence Encoder
   */
  public async createSearch(searchText: string, firebaseUid: string): Promise<SearchModel> {
    let embedding = "[]"; // Default empty embedding
    
    try {
      if (process.env.NODE_ENV === 'test') {
        console.log("Skipping search embedding computation in test environment");
      } else {
        const embeddingPromise = (async () => {
          const model = await getLoadedModel();
          const embeddings = await model.embed([searchText]);
          const embeddingArray = embeddings.arraySync()[0];
          return JSON.stringify(embeddingArray);
        })();
        
        const timeoutPromise = new Promise<string>((_, reject) => 
          setTimeout(() => reject(new Error('Search embedding computation timeout')), 10000)
        );
        
        embedding = await Promise.race([embeddingPromise, timeoutPromise]);
      }
    } catch (error) {
      console.error("Error computing search embedding:", error);
    }

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
    let embedding = "[]"; // Default empty embedding
    
    try {
      if (process.env.NODE_ENV === 'test') {
        console.log("Skipping similar search embedding computation in test environment");
      } else {
        const embeddingPromise = (async () => {
          const model = await getLoadedModel();
          const embeddings = await model.embed([searchText]);
          const embeddingArray = embeddings.arraySync()[0];
          return JSON.stringify(embeddingArray);
        })();
        
        const timeoutPromise = new Promise<string>((_, reject) => 
          setTimeout(() => reject(new Error('Similar search embedding computation timeout')), 10000)
        );
        
        embedding = await Promise.race([embeddingPromise, timeoutPromise]);
      }
    } catch (error) {
      console.error("Error computing similar search embedding:", error);
    }

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
