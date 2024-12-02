import { Body, CurrentUser, Delete, Get, JsonController, Params, Post } from 'routing-controllers';

import { UserModel } from '../../models/UserModel';
import { PostService } from '../../services/PostService';
import {
  CreatePostRequest,
  EditPostPriceRequest,
  EditPriceResponse,
  FilterPostsRequest,
  FilterPostsByPriceRequest,
  FilterPostsByConditionRequest,
  GetPostResponse,
  GetPostsResponse,
  GetSearchedPostsRequest,
  IsSavedPostResponse,
} from '../../types';
import { UuidParam } from '../validators/GenericRequests';

@JsonController('post/')
export class PostController {
  private postService: PostService;

  constructor(postService: PostService) {
    this.postService = postService;
  }

  @Get()
  async getPosts(@CurrentUser() user: UserModel): Promise<GetPostsResponse> {
    return { posts: await this.postService.getAllPosts(user) };
  }

  @Get('id/:id/')
  async getPostById(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetPostResponse> {
    return { post: await this.postService.getPostById(user, params) };
  }

  @Get('userId/:id/')
  async getPostsByUserId(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetPostsResponse> {
    return { posts: await this.postService.getPostsByUserId(user, params) };
  }

  @Post()
  async createPost(@Body({ options: { limit: process.env.UPLOAD_SIZE_LIMIT } }) createPostRequest: CreatePostRequest): Promise<GetPostResponse> {
    return { post: await this.postService.createPost(createPostRequest) };
  }

  @Delete('id/:id/')
  async deletePostById(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetPostResponse> {
    return { post: await this.postService.deletePostById(user, params) };
  }

  @Post('search/')
  async searchPosts(@CurrentUser() user: UserModel, @Body() getSearchedPostsRequest: GetSearchedPostsRequest): Promise<GetPostsResponse> {
    return { posts: await this.postService.searchPosts(user, getSearchedPostsRequest) };
  }

  @Post('filter/')
  async filterPosts(@CurrentUser() user: UserModel, @Body() filterPostsRequest: FilterPostsRequest): Promise<GetPostsResponse> {
    return { posts: await this.postService.filterPosts(user, filterPostsRequest) };
  }

  @Post('filterByPrice/')
  async filterPostsByPrice(@CurrentUser() user: UserModel, @Body() filterPostsByPriceRequest: FilterPostsByPriceRequest): Promise<GetPostsResponse> {
    return { posts: await this.postService.filterPostsByPrice(user, filterPostsByPriceRequest) };
  }

  @Post('filterPriceHighToLow/')
  async filterPriceHighToLow(@CurrentUser() user: UserModel): Promise<GetPostsResponse> {
    return { posts: await this.postService.filterPriceHighToLow(user) };
  }

  @Post('filterPriceLowToHigh/')
  async filterPriceLowToHigh(@CurrentUser() user: UserModel): Promise<GetPostsResponse> {
    return { posts: await this.postService.filterPriceLowToHigh(user) };
  }

  @Post('filterNewlyListed/')
  async filterNewlyListed(@CurrentUser() user: UserModel): Promise<GetPostsResponse> {
    return { posts: await this.postService.filterNewlyListed(user) };
  }

  @Post('filterByCondition/')
  async filterByCondition(@CurrentUser() user: UserModel, @Body() filterPostsByConditionRequest: FilterPostsByConditionRequest): Promise<GetPostsResponse> {
    return { posts: await this.postService.filterByCondition(user, filterPostsByConditionRequest) };
  }

  @Get('archive/')
  async getArchivedPosts(@CurrentUser() user: UserModel): Promise<GetPostsResponse> {
    return { posts: await this.postService.getArchivedPosts(user) };
  }

  @Get('archive/userId/:id/')
  async getArchivedPostsByUserId(@Params() params: UuidParam): Promise<GetPostsResponse> {
    return { posts: await this.postService.getArchivedPostsByUserId(params) };
  }

  @Post('archive/postId/:id/')
  async archivePost(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetPostResponse> {
    return { post: await this.postService.archivePost(user, params) };
  }

  @Post('archiveAll/userId/:id/')
  async archiveAllPostsByUserId(@Params() params: UuidParam): Promise<GetPostsResponse> {
    return { posts: await this.postService.archiveAllPostsByUserId(params) };
  }

  @Get('save/')
  async getSavedPostsByUserId(@CurrentUser() user: UserModel): Promise<GetPostsResponse> {
    return { posts: await this.postService.getSavedPostsByUserId(user) };
  }

  @Post('save/postId/:id/')
  async savePost(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetPostResponse> {
    return { post: await this.postService.savePost(user, params) };
  }

  @Post('unsave/postId/:id/')
  async unsavePost(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetPostResponse> {
    return { post: await this.postService.unsavePost(user, params) };
  }

  @Get('isSaved/postId/:id/')
  async isSavedPost(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<IsSavedPostResponse> {
    return { isSaved: await this.postService.isSavedPost(user, params) };
  }

  @Post('edit/postId/:id/')
  async editPrice(@Body() editPriceRequest: EditPostPriceRequest, @CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<EditPriceResponse> {
    return { new_price: await (await this.postService.editPostPrice(user, params, editPriceRequest)).altered_price };
  }

  @Get('similar/postId/:id/')
  async similarPosts(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetPostsResponse> {
    return { posts: await this.postService.similarPosts(user, params) };
  }
}