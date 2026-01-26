import {
  Body,
  CurrentUser,
  Delete,
  Get,
  JsonController,
  Params,
  Post,
  QueryParam,
} from "routing-controllers";

import { UserModel } from "../../models/UserModel";
import { PostService } from "../../services/PostService";
import {
  CreatePostRequest,
  EditPostPriceRequest,
  EditPriceResponse,
  FilterPostsRequest,
  FilterPostsByPriceRequest,
  FilterPostsByConditionRequest,
  FilterPostsUnifiedRequest,
  GetPostResponse,
  GetPostsResponse,
  GetSearchedPostsRequest,
  GetSearchedPostsResponse,
  IsSavedPostResponse,
} from "../../types";
import { UuidParam, FirebaseUidParam } from "../validators/GenericRequests";

@JsonController("post/")
export class PostController {
  private postService: PostService;

  constructor(postService: PostService) {
    this.postService = postService;
  }

  @Get()
  async getPosts(
    @CurrentUser() user: UserModel,
    @QueryParam("page", { required: false }) page: number = 1, // Default page 1
    @QueryParam("limit", { required: false }) limit: number = 10, // Default limit 10
  ): Promise<GetPostsResponse> {
    return { posts: await this.postService.getAllPosts(user, page, limit) };
  }

  @Get("id/:id/")
  async getPostById(
    @CurrentUser() user: UserModel,
    @Params() params: UuidParam,
  ): Promise<GetPostResponse> {
    return { post: await this.postService.getPostById(user, params) };
  }

  @Get("userId/:id/")
  async getPostsByUserId(
    @CurrentUser() user: UserModel,
    @Params() params: FirebaseUidParam,
  ): Promise<GetPostsResponse> {
    return { posts: await this.postService.getPostsByUserId(user, params) };
  }

  @Post()
  async createPost(
    @CurrentUser() user: UserModel,
    @Body({ options: { limit: process.env.UPLOAD_SIZE_LIMIT } })
    createPostRequest: CreatePostRequest,
  ): Promise<GetPostResponse> {
    console.log("=== POST CONTROLLER DEBUG ===");
    console.log("user from @CurrentUser():", user);
    console.log("user type:", typeof user);
    console.log("user === null:", user === null);
    console.log("user === undefined:", user === undefined);
    console.log("==============================");
    try {
      const newPost = await this.postService.createPost(
        createPostRequest,
        user,
      );
      return { post: newPost.getPostInfo() };
    } catch (error) {
      // THIS IS THE MOST IMPORTANT PART
      console.error(
        "--- 🛑 A CATCH BLOCK IN THE CONTROLLER FINALLY CAUGHT THE REAL ERROR 🛑 ---",
      );
      console.error(error); // This will log the REAL database error
      console.error("--- END OF THE REAL ERROR ---");

      // Re-throw the error so the app still reports a failure
      throw error;
    }
  }

  @Delete("id/:id/")
  async deletePostById(
    @CurrentUser() user: UserModel,
    @Params() params: UuidParam,
  ): Promise<GetPostResponse> {
    return { post: await this.postService.deletePostById(user, params) };
  }

  @Post("search/")
  async searchPosts(
    @CurrentUser() user: UserModel,
    @Body() getSearchedPostsRequest: GetSearchedPostsRequest,
  ): Promise<GetSearchedPostsResponse> {
    const result = await this.postService.searchPosts(
      user,
      getSearchedPostsRequest,
    );
    return { posts: result.posts, searchId: result.searchId };
  }

  @Post("filterByCategories/")
  async filterPostsByCategories(
    @CurrentUser() user: UserModel,
    @Body() filterPostsRequest: FilterPostsRequest,
    @QueryParam("page", { required: false }) page: number = 1,
    @QueryParam("limit", { required: false }) limit: number = 10,
  ): Promise<GetPostsResponse> {
    return {
      posts: await this.postService.filterPostsByCategories(
        user,
        filterPostsRequest,
        page,
        limit,
      ),
    };
  }

  @Post("filterByPrice/")
  async filterPostsByPrice(
    @CurrentUser() user: UserModel,
    @Body() filterPostsByPriceRequest: FilterPostsByPriceRequest,
    @QueryParam("page", { required: false }) page: number = 1,
    @QueryParam("limit", { required: false }) limit: number = 10,
  ): Promise<GetPostsResponse> {
    return {
      posts: await this.postService.filterPostsByPrice(
        user,
        filterPostsByPriceRequest,
        page,
        limit,
      ),
    };
  }

  @Post("filterPriceHighToLow/")
  async filterPriceHighToLow(
    @CurrentUser() user: UserModel,
    @QueryParam("page", { required: false }) page: number = 1,
    @QueryParam("limit", { required: false }) limit: number = 10,
  ): Promise<GetPostsResponse> {
    return {
      posts: await this.postService.filterPriceHighToLow(user, page, limit),
    };
  }

  @Post("filterPriceLowToHigh/")
  async filterPriceLowToHigh(
    @CurrentUser() user: UserModel,
    @QueryParam("page", { required: false }) page: number = 1,
    @QueryParam("limit", { required: false }) limit: number = 10,
  ): Promise<GetPostsResponse> {
    return {
      posts: await this.postService.filterPriceLowToHigh(user, page, limit),
    };
  }

  @Post("filterNewlyListed/")
  async filterNewlyListed(
    @CurrentUser() user: UserModel,
    @QueryParam("page", { required: false }) page: number = 1,
    @QueryParam("limit", { required: false }) limit: number = 10,
  ): Promise<GetPostsResponse> {
    return {
      posts: await this.postService.filterNewlyListed(user, page, limit),
    };
  }

  @Post("filterByCondition/")
  async filterByCondition(
    @CurrentUser() user: UserModel,
    @Body() filterPostsByConditionRequest: FilterPostsByConditionRequest,
    @QueryParam("page", { required: false }) page: number = 1,
    @QueryParam("limit", { required: false }) limit: number = 10,
  ): Promise<GetPostsResponse> {
    return {
      posts: await this.postService.filterByCondition(
        user,
        filterPostsByConditionRequest,
        page,
        limit,
      ),
    };
  }

  @Post("filter/")
  async filterPosts(
    @CurrentUser() user: UserModel,
    @Body() filterPostsUnifiedRequest: FilterPostsUnifiedRequest,
    @QueryParam("page", { required: false }) page: number = 1,
    @QueryParam("limit", { required: false }) limit: number = 10,
  ): Promise<GetPostsResponse> {
    return {
      posts: await this.postService.filterPostsUnified(
        user,
        filterPostsUnifiedRequest,
        page,
        limit,
      ),
    };
  }

  @Get("archive/")
  async getArchivedPosts(
    @CurrentUser() user: UserModel,
  ): Promise<GetPostsResponse> {
    return { posts: await this.postService.getArchivedPosts(user) };
  }

  @Get("archive/userId/:id/")
  async getArchivedPostsByUserId(
    @Params() params: FirebaseUidParam,
  ): Promise<GetPostsResponse> {
    return { posts: await this.postService.getArchivedPostsByUserId(params) };
  }

  @Post("archive/postId/:id/")
  async archivePost(
    @CurrentUser() user: UserModel,
    @Params() params: UuidParam,
  ): Promise<GetPostResponse> {
    return { post: await this.postService.archivePost(user, params) };
  }

  @Post("archiveAll/userId/:id/")
  async archiveAllPostsByUserId(
    @Params() params: FirebaseUidParam,
  ): Promise<GetPostsResponse> {
    return { posts: await this.postService.archiveAllPostsByUserId(params) };
  }

  @Get("save/")
  async getSavedPostsByUserId(
    @CurrentUser() user: UserModel,
  ): Promise<GetPostsResponse> {
    return { posts: await this.postService.getSavedPostsByUserId(user) };
  }

  @Post("save/postId/:id/")
  async savePost(
    @CurrentUser() user: UserModel,
    @Params() params: UuidParam,
  ): Promise<GetPostResponse> {
    return { post: await this.postService.savePost(user, params) };
  }

  @Post("unsave/postId/:id/")
  async unsavePost(
    @CurrentUser() user: UserModel,
    @Params() params: UuidParam,
  ): Promise<GetPostResponse> {
    return { post: await this.postService.unsavePost(user, params) };
  }

  @Get("isSaved/postId/:id/")
  async isSavedPost(
    @CurrentUser() user: UserModel,
    @Params() params: UuidParam,
  ): Promise<IsSavedPostResponse> {
    return { isSaved: await this.postService.isSavedPost(user, params) };
  }

  @Post("edit/postId/:id/")
  async editPrice(
    @Body() editPriceRequest: EditPostPriceRequest,
    @CurrentUser() user: UserModel,
    @Params() params: UuidParam,
  ): Promise<EditPriceResponse> {
    return {
      new_price: await (
        await this.postService.editPostPrice(user, params, editPriceRequest)
      ).altered_price,
    };
  }

  @Get("similar/postId/:id/")
  async similarPosts(
    @CurrentUser() user: UserModel,
    @Params() params: UuidParam,
  ): Promise<GetPostsResponse> {
    return { posts: await this.postService.similarPosts(user, params) };
  }

  @Get("suggested/")
  async getSuggestedPosts(
    @CurrentUser() user: UserModel,
    @QueryParam("limit", { required: false }) limit: number = 10,
  ): Promise<GetPostsResponse> {
    return { posts: await this.postService.getSuggestedPosts(user, limit) };
  }

  @Get("searchSuggestions/:searchIndex/")
  async getSearchSuggestions(
    @Params() params: { searchIndex: string },
    @QueryParam("count", { required: false }) count: number = 5,
  ): Promise<{ postIds: string[] }> {
    const postIds = await this.postService.getSearchSuggestions(
      params.searchIndex,
      count,
    );
    return { postIds };
  }

  @Get("purchaseSuggestions/")
  async getPurchaseSuggestions(
    @CurrentUser() user: UserModel,
    @QueryParam("limit", { required: false }) limit: number = 10,
  ): Promise<{ postIds: string[] }> {
    const postIds = await this.postService.getPurchaseSuggestions(user, limit);
    return { postIds };
  }
}
