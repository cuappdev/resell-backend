import { Body, CurrentUser, Delete, Get, JsonController, Params, Post } from 'routing-controllers';

import { UserModel } from '../../models/UserModel';
import { PostService } from '../../services/PostService';
import {
  CreatePostRequest,
  FilterPostsRequest,
  GetPostResponse,
  GetPostsResponse,
  GetSearchedPostsRequest,
  IsSavedPostResponse,
} from '../../types';
import { PostAndUserUuidParam, UuidParam } from '../validators/GenericRequests';

@JsonController('post/')
export class PostController {
  private postService: PostService;

  constructor(postService: PostService) {
    this.postService = postService;
  }

  @Get()
  async getPosts(): Promise<GetPostsResponse> {
    const posts = await this.postService.getAllPosts();
    return { posts: posts.map((post) => post.getPostInfo()) };
  }

  @Get('id/:id/')
  async getPostById(@Params() params: UuidParam): Promise<GetPostResponse  | undefined> {
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

  @Get('save/userId/:userId/postId/:postId/') 
  async savePost(@Params() params: PostAndUserUuidParam): Promise<GetPostResponse> {
    return { post: await this.postService.savePost(params) }; 
  }

  @Get('unsave/userId/:userId/postId/:postId/') 
  async unsavePost(@Params() params: PostAndUserUuidParam): Promise<GetPostResponse> {
      return { post: await this.postService.unsavePost(params) };
  }
  
  @Get('isSaved/userId/:userId/postId/:postId/') 
  async isSavedPost(@Params() params: PostAndUserUuidParam): Promise<IsSavedPostResponse> {
    return { isSaved: await this.postService.isSavedPost(params) }; 
  }
}