import { Body, Delete, Get, JsonController, Params, Post } from 'routing-controllers';

import { PostService } from '../../services/PostService';
import { CreatePostRequest, GetPostResponse, GetPostsResponse, getSavedPostsRequest } from '../../types';
import { UuidParam } from '../validators/GenericRequests';

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
    return { post: await this.postService.getPostById(params.id) };
  }

  @Get('userId/:id/')
  async getPostsByUserId(@Params() params: UuidParam): Promise<GetPostsResponse> {
    return { posts: await this.postService.getPostsByUserId(params.id) };
  }

  @Post()
  async createPost(@Body() createPostRequest: CreatePostRequest): Promise<GetPostResponse> {
    const post = await this.postService.createPost(createPostRequest);
    return { post: post };
  }

  @Delete(':id/')
  async deletePostById(@Params() params: UuidParam): Promise<GetPostResponse> {
    return { post: await this.postService.deletePostById(params.id) };
  }

  
  @Post('search/')
  async searchPosts(@Body() getSavedPostsRequest: getSavedPostsRequest): Promise<GetPostsResponse> {
    return { posts: await this.postService.searchPosts(getSavedPostsRequest) };
  }
}