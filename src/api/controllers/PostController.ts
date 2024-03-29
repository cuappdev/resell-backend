import { Body, CurrentUser, Delete, Get, JsonController, Params, Post } from 'routing-controllers';

import { UserModel } from '../../models/UserModel';
import { PostService } from '../../services/PostService';
import {
  CreatePostRequest,
  EditPostPriceRequest,
  EditPriceResponse,
  FilterPostsRequest,
  FilterPostsByPriceRequest,
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
  async getPosts(): Promise<GetPostsResponse> {
    return { posts: await this.postService.getAllPosts() };
  }

  @Get('id/:id/')
  async getPostById(@Params() params: UuidParam): Promise<GetPostResponse> {
    return { post: await this.postService.getPostById(params) };
  }

  @Get('userId/:id/')
  async getPostsByUserId(@Params() params: UuidParam): Promise<GetPostsResponse> {
    return { posts: await this.postService.getPostsByUserId(params) };
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
  async searchPosts(@Body() getSearchedPostsRequest: GetSearchedPostsRequest): Promise<GetPostsResponse> {
    return { posts: await this.postService.searchPosts(getSearchedPostsRequest) };
  }

  @Post('filter/')
  async filterPosts(@Body() filterPostsRequest: FilterPostsRequest): Promise<GetPostsResponse> {
    return { posts: await this.postService.filterPosts(filterPostsRequest) };
  }

  @Post('filterByPrice/')
  async filterPostsByPrice(@Body() filterPostsByPriceRequest: FilterPostsByPriceRequest): Promise<GetPostsResponse> {
    return { posts: await this.postService.filterPostsByPrice(filterPostsByPriceRequest) };
  }

  @Get('archive/')
  async getArchivedPosts(): Promise<GetPostsResponse> {
    return { posts: await this.postService.getArchivedPosts() };
  }

  @Get('archive/userId/:id/')
  async getArchivedPostsByUserId(@Params() params: UuidParam): Promise<GetPostsResponse> {
    return { posts: await this.postService.getArchivedPostsByUserId(params) };
  }

  @Post('archive/postId/:id/')
  async archivePost(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetPostResponse> {
    return { post: await this.postService.archivePost(user, params) };
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
  async similarPosts(@Params() params: UuidParam): Promise<GetPostsResponse> {
    return { posts: await this.postService.similarPosts(params) };
  }
}