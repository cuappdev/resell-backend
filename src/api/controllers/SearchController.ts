import { Body, CurrentUser, Get, JsonController, Post, QueryParam } from 'routing-controllers';

import { UserModel } from '../../models/UserModel';
import { SearchService } from '../../services/SearchService';
import { SearchModel } from '../../models/SearchModel';

export interface CreateSearchRequest {
  searchText: string;
}

export interface CreateSearchResponse {
  searchId: string;
  searchText: string;
}

export interface GetSearchesResponse {
  searches: {
    id: string;
    searchText: string;
    createdAt: Date;
  }[];
}

@JsonController('search/')
export class SearchController {
  private searchService: SearchService;

  constructor() {
    this.searchService = new SearchService();
  }

  /**
   * Get user's search history
   * GET /api/search/
   */
  @Get()
  async getUserSearches(
    @CurrentUser() user: UserModel,
    @QueryParam('limit', { required: false }) limit: number = 20
  ): Promise<GetSearchesResponse> {
    const searches = await this.searchService.getSearchesByUserId(user.firebaseUid);
    
    // Return most recent searches first, limited
    const recentSearches = searches
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map(search => ({
        id: search.id,
        searchText: search.searchText,
        createdAt: search.createdAt
      }));

    return { searches: recentSearches };
  }

  /**
   * Create a new search record
   * POST /api/search/
   */
  @Post()
  async createSearch(
    @CurrentUser() user: UserModel,
    @Body() createSearchRequest: CreateSearchRequest
  ): Promise<CreateSearchResponse> {
    const search = await this.searchService.createSearch(
      createSearchRequest.searchText,
      user.firebaseUid
    );

    return {
      searchId: search.id,
      searchText: search.searchText
    };
  }
}
