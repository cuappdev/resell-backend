import { Body, Delete, Get, JsonController, Params, Post } from 'routing-controllers';

import { PostService } from '../../services/PostService';
import { CreatePostRequest, ErrorResponse, getErrorMessage, GetPostResponse, GetPostsResponse } from '../../types';
import { UuidParam } from '../validators/GenericRequests';

@JsonController('post/')
export class PostController {
  private postService: PostService;

  constructor(postService: PostService) {
    this.postService = postService;
  }

  @Get()
  async getPosts(): Promise<GetPostsResponse | ErrorResponse> {
    try {
      const posts = await this.postService.getAllPosts();
      return { posts: posts.map((post) => post.getPostInfo()) };
    } catch (error) {
      return { error: getErrorMessage(error) }
    }
  }

  @Get('id/:postId/')
  async getPostById(@Params() params: UuidParam): Promise<GetPostResponse | ErrorResponse> {
    try {
      return { post: await this.postService.getPostById(params.id) };
    } catch (error) {
      return { error: getErrorMessage(error) }
    }
  }

  @Get('userId/:userId/')
  async getPostsByUserId(@Params() params: UuidParam): Promise<GetPostsResponse | ErrorResponse> {
    try {
      return { posts: await this.postService.getPostsByUserId(params.id) };
    } catch (error) {
      return { error: getErrorMessage(error) }
    }
  }

  @Post()
  async createPost(@Body() createPostRequest: CreatePostRequest): Promise<GetPostResponse | ErrorResponse> {
    try {
      const post = await this.postService.createPost(createPostRequest);
    return { post: post };
    } catch (error) {
      return { error: getErrorMessage(error) }
    }
  }

  @Delete(':id/')
  async deletePostById(@Params() params: UuidParam): Promise<GetPostResponse | ErrorResponse> {
    try {
      return { post: await this.postService.deletePostById(params.id) };
    } catch (error) {
      return { error: getErrorMessage(error) }
    }
  }
}