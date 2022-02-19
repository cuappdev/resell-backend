import {
    JsonController, Params, Get, Post, Delete, UseBefore, Body, BodyParam,
  } from 'routing-controllers';
  import { UserModel } from '../../models/UserModel'
  import { PostModel } from '../../models/PostModel'
  import { PostService } from '../../services/PostService';
  import { Inject } from 'typedi';
  import {
    GetPostsResponse,
    GetPostResponse,
    CreatePostRequest,
    Uuid,
    GenericSuccessResponse,
  } from '../../types';
  import { EmailParam, UuidParam } from '../validators/GenericRequests';
  
  // import { UserAuthentication } from '../middleware/UserAuthentication';
  // import { AuthenticatedUser } from '../decorators/AuthenticatedUser';
  
  // @UseBefore(UserAuthentication)
  @JsonController('post/')
  export class PostController {
    private postService: PostService;
  
    constructor(postService: PostService) {
      this.postService = postService;
    }
  
    // @Get()
    // async helloWorldName(@BodyParam("name") name: string): Promise<string> {
    //   return "Hello world, ".concat(name, "!");
    // }
  
    @Get()
    async getPosts(): Promise<GetPostsResponse> {
      const posts = await this.postService.getAllPosts();
      return { error: null, posts: posts.map((post) => post.getPostInfo()) };
    }
  
    @Get('id/:id/')
    async getPostById(@Params() params: UuidParam): Promise<GetPostResponse> {
      return { error: null, post: await this.postService.getPostById(params.id) };
    }

    @Get('userId/:id/')
    async getPostsByUserId(@Params() params: UuidParam): Promise<GetPostsResponse> {
      return { error: null, posts: await this.postService.getPostsByUserId(params.id) };
    }
  
    @Post()
    async createPost(@Body() createPostRequest: CreatePostRequest): Promise<GetPostResponse> {
      const post = await this.postService.createPost(createPostRequest);
      return { error: null, post: post };
    }
  
    @Delete(':id/')
    async deletePostById(@Params() params: UuidParam): Promise<GetPostResponse> {
      return { error: null, post: await this.postService.deletePostById(params.id) };
    }
  }