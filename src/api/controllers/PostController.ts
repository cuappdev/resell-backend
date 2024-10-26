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
import { OpenAPI } from 'routing-controllers-openapi';

@JsonController('post/')
export class PostController {
  private postService: PostService;

  constructor(postService: PostService) {
    this.postService = postService;
  }

  @Get()
  @OpenAPI({
    summary: 'Get all posts',
    description: 'Retrieves all posts',
    responses: {
      '200': { description: 'Posts returned successfully' },
    }
  })
  async getPosts(@CurrentUser() user: UserModel): Promise<GetPostsResponse> {
    return { posts: await this.postService.getAllPosts(user) };
  }

  @Get('id/:id/')
  @OpenAPI({
    summary: 'Get post by id',
    description: 'Retrieves a post by its id',
    responses: {
      '200': { description: 'Post returned successfully' },
      '404': { description: 'Post not found' }
    }
  })
  async getPostById(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetPostResponse> {
    return { post: await this.postService.getPostById(user, params) };
  }

  @Get('userId/:id/')
  @OpenAPI({
    summary: 'Get posts by user id',
    description: 'Retrieves all posts by a user id',
    responses: {
      '200': { description: 'Posts returned successfully' },
      '404': { description: 'Posts not found' }
    }
  })
  async getPostsByUserId(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetPostsResponse> {
    return { posts: await this.postService.getPostsByUserId(user, params) };
  }

  @Post()
  @OpenAPI({
    summary: 'Create new post',
    description: 'Creates a new post',
    responses: {
      '200': { description: 'Post created successfully' },
      '400': { description: 'Invalid request body' }
    }
  })
  async createPost(@Body({ options: { limit: process.env.UPLOAD_SIZE_LIMIT } }) createPostRequest: CreatePostRequest): Promise<GetPostResponse> {
    return { post: await this.postService.createPost(createPostRequest) };
  }

  @Delete('id/:id/')
  @OpenAPI({
    summary: 'Delete post by id',
    description: 'Deletes a post by its id',
    responses: {
      '200': { description: 'Post deleted successfully' },
      '404': { description: 'Post not found' }
    }
  })
  async deletePostById(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetPostResponse> {
    return { post: await this.postService.deletePostById(user, params) };
  }

  @Post('search/')
  @OpenAPI({
    summary: 'Search posts',
    description: 'Searches for posts',
    responses: {
      '200': { description: 'Posts returned successfully' },
    }
  })
  async searchPosts(@CurrentUser() user: UserModel, @Body() getSearchedPostsRequest: GetSearchedPostsRequest): Promise<GetPostsResponse> {
    return { posts: await this.postService.searchPosts(user, getSearchedPostsRequest) };
  }

  @Post('filter/')
  @OpenAPI({
    summary: 'Filter posts',
    description: 'Filters posts',
    responses: {
      '200': { description: 'Posts returned successfully' },
    }
  })
  async filterPosts(@CurrentUser() user: UserModel, @Body() filterPostsRequest: FilterPostsRequest): Promise<GetPostsResponse> {
    return { posts: await this.postService.filterPosts(user, filterPostsRequest) };
  }

  @Post('filterByPrice/')
  @OpenAPI({
    summary: 'Filter posts by price',
    description: 'Filters posts by price',
    responses: {
      '200': { description: 'Posts returned successfully' },
    }
  })
  async filterPostsByPrice(@CurrentUser() user: UserModel, @Body() filterPostsByPriceRequest: FilterPostsByPriceRequest): Promise<GetPostsResponse> {
    return { posts: await this.postService.filterPostsByPrice(user, filterPostsByPriceRequest) };
  }

  @Get('archive/')
  @OpenAPI({
    summary: 'Get archived posts',
    description: 'Retrieves all archived posts',
    responses: {
      '200': { description: 'Posts returned successfully' },
    }
  })
  async getArchivedPosts(@CurrentUser() user: UserModel): Promise<GetPostsResponse> {
    return { posts: await this.postService.getArchivedPosts(user) };
  }

  @Get('archive/userId/:id/')
  @OpenAPI({
    summary: 'Get archived posts by user id',
    description: 'Retrieves all archived posts by a user id',
    responses: {
      '200': { description: 'Posts returned successfully' },
      '404': { description: 'Posts not found' }
    }
  })
  async getArchivedPostsByUserId(@Params() params: UuidParam): Promise<GetPostsResponse> {
    return { posts: await this.postService.getArchivedPostsByUserId(params) };
  }

  @Post('archive/postId/:id/')
  @OpenAPI({
    summary: 'Archive post',
    description: 'Archives a post',
    responses: {
      '200': { description: 'Post archived successfully' },
      '404': { description: 'Post not found' }
    }
  })
  async archivePost(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetPostResponse> {
    return { post: await this.postService.archivePost(user, params) };
  }

  @Post('archiveAll/userId/:id/')
  @OpenAPI({
    summary: 'Archive all posts by user id',
    description: 'Archives all posts by a user id',
    responses: {
      '200': { description: 'Posts archived successfully' },
      '404': { description: 'Posts not found' }
    }
  })
  async archiveAllPostsByUserId(@Params() params: UuidParam): Promise<GetPostsResponse> {
    return { posts: await this.postService.archiveAllPostsByUserId(params) };
  }

  @Get('save/')
  @OpenAPI({
    summary: 'Get saved posts',
    description: 'Retrieves all saved posts',
    responses: {
      '200': { description: 'Posts returned successfully' },
    }
  })
  async getSavedPostsByUserId(@CurrentUser() user: UserModel): Promise<GetPostsResponse> {
    return { posts: await this.postService.getSavedPostsByUserId(user) };
  }

  @Post('save/postId/:id/')
  @OpenAPI({
    summary: 'Save post',
    description: 'Saves a post',
    responses: {
      '200': { description: 'Post saved successfully' },
      '404': { description: 'Post not found' }
    }
  })
  async savePost(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetPostResponse> {
    return { post: await this.postService.savePost(user, params) };
  }

  @Post('unsave/postId/:id/')
  @OpenAPI({
    summary: 'Unsave post',
    description: 'Unsaves a post',
    responses: {
      '200': { description: 'Post unsaved successfully' },
      '404': { description: 'Post not found' }
    }
  })
  async unsavePost(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetPostResponse> {
    return { post: await this.postService.unsavePost(user, params) };
  }

  @Get('isSaved/postId/:id/')
  @OpenAPI({
    summary: 'Check if post is saved',
    description: 'Checks if a post is saved',
    responses: {
      '200': { description: 'Post is saved' },
      '404': { description: 'Post not found' }
    }
  })
  async isSavedPost(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<IsSavedPostResponse> {
    return { isSaved: await this.postService.isSavedPost(user, params) };
  }

  @Post('edit/postId/:id/')
  @OpenAPI({
    summary: 'Edit post',
    description: 'Edits a post',
    responses: {
      '200': { description: 'Post edited successfully' },
      '404': { description: 'Post not found' }
    }
  })
  async editPrice(@Body() editPriceRequest: EditPostPriceRequest, @CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<EditPriceResponse> {
    return { new_price: await (await this.postService.editPostPrice(user, params, editPriceRequest)).altered_price };
  }

  @Get('similar/postId/:id/')
  @OpenAPI({
    summary: 'Get similar posts',
    description: 'Retrieves similar posts',
    responses: {
      '200': { description: 'Posts returned successfully' },
      '404': { description: 'Post not found' }
    }
  })
  async similarPosts(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetPostsResponse> {
    return { posts: await this.postService.similarPosts(user, params) };
  }
}