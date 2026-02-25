import { ForbiddenError, NotFoundError } from "routing-controllers";
import { Service } from "typedi";
import { EntityManager } from "typeorm";
import { InjectManager } from "typeorm-typedi-extensions";

import { UuidParam, FirebaseUidParam } from '../api/validators/GenericRequests';
import { PostModel } from '../models/PostModel';
import { UserModel } from '../models/UserModel';
import Repositories, { TransactionsManager } from '../repositories';
import { CreatePostRequest, FilterPostsRequest, FilterPostsByPriceRequest, FilterPostsByConditionRequest, GetSearchedPostsRequest, EditPostPriceRequest, FilterPostsUnifiedRequest, FilterPostsByEventTagsRequest, AddEventTagsToPostRequest, RemoveEventTagsFromPostRequest } from '../types';
import { uploadImage } from '../utils/Requests';
// import { encoder } from '../app';
import { PostRepository } from "src/repositories/PostRepository";
import { CategoryRepository } from "src/repositories/CategoryRepository";
import { FindTokensRequest } from "../types";
import { NotifService } from "./NotifService";
import { SearchService } from "./SearchService"; // Import SearchService
import pgvector from "pgvector";
import { getLoadedModel } from "../utils/SentenceEncoder";
//require('@tensorflow-models/universal-sentence-encoder')

@Service()
export class PostService {
  private transactions: TransactionsManager;

  constructor(@InjectManager() entityManager: EntityManager) {
    this.transactions = new TransactionsManager(entityManager);
  }

  public async getAllPosts(
    user: UserModel,
    page: number,
    limit: number,
  ): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const skip = (page - 1) * limit;
      const activeUserPosts = this.filterInactiveUserPosts(
        await postRepository.getAllPostsPaginated(skip, limit),
      );
      return this.filterBlockedUserPosts(activeUserPosts, user);
    });
  }

  public async getPostById(
    user: UserModel,
    params: UuidParam,
  ): Promise<PostModel> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(params.id);
      if (!post) throw new NotFoundError("Post not found!");
      if (!post.user?.isActive) throw new NotFoundError("User is not active!");
      const postUnblocked = await this.filterBlockedUserPosts([post], user);
      if (postUnblocked.length == 0)
        throw new ForbiddenError("User is blocked!");
      return post;
    });
  }

  public async getPostsByUserId(
    currentUser: UserModel,
    params: FirebaseUidParam,
  ): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const userPosts = await postRepository.getPostsByUserId(params.id);
      return this.filterBlockedUserPosts(userPosts, currentUser);
    });
  }

  public async createPost(post: CreatePostRequest, authenticatedUser: UserModel): Promise<PostModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const user = authenticatedUser;
      if (!user) throw new NotFoundError("User is null or undefined!");
      if (!user.isActive) throw new NotFoundError("User is not active!");
      if (!user.firebaseUid)
        throw new NotFoundError("User firebaseUid missing!");
      const postRepository = Repositories.post(transactionalEntityManager);
      const images: string[] = [];
      for (const imageBase64 of post.imagesBase64) {
        const image = await uploadImage(imageBase64);
        const imageUrl = image.data;
        images.push(imageUrl);
      }
      const categoryRepository = Repositories.category(transactionalEntityManager);
      const categories = await categoryRepository.findOrCreateByNames(post.categories);
      const eventTagRepository = Repositories.eventTag(transactionalEntityManager);
      const eventTags = await eventTagRepository.findOrCreateByNames(post.eventTags || []);
      let embedding = null;
      try {
        if (process.env.NODE_ENV === "test") {
          console.log("Skipping embedding computation in test environment");
        } else {
          const embeddingPromise = (async () => {
            const model = await getLoadedModel();
            const sentence = `${post.title} ${post.description}`;
            const sentences = [sentence];
            const embeddingTensor = await model.embed(sentences);
            const embeddingArray = await embeddingTensor.array();
            return embeddingArray[0];
          })();

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Embedding computation timeout")),
              10000,
            ),
          );

          embedding = await Promise.race([embeddingPromise, timeoutPromise]);
        }
      } catch (error) {
        console.error("Error computing embedding:", error);
        embedding = null;
      }
      const freshPost = await postRepository.createPost(post.title, post.description, categories, eventTags, post.condition, post.originalPrice, images, user, (embedding ?? []) as number[]);
      if (embedding && Array.isArray(embedding) && embedding.length > 0) {
        const requestRepository = Repositories.request(
          transactionalEntityManager,
        );
        // TODO: how many should we get?
        const similarRequests = await requestRepository.findSimilarRequests(
          embedding,
          user.firebaseUid,
          10,
        );
        for (const request of similarRequests) {
          await requestRepository.addMatchToRequest(request, freshPost);
        }
      }
      return freshPost;
    });
  }

  public async deletePostById(
    user: UserModel,
    params: UuidParam,
  ): Promise<PostModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(params.id);
      if (!post) throw new NotFoundError("Post not found!");
      if (user.firebaseUid != post.user?.firebaseUid && !user.admin)
        throw new ForbiddenError("User is not poster!");
      return postRepository.deletePost(post);
    });
  }

  public async searchPosts(
    user: UserModel,
    getSearchedPostsRequest: GetSearchedPostsRequest,
  ): Promise<{ posts: PostModel[]; searchId: string }> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);

      // Record the search and get the search ID
      const searchService = new SearchService();
      let searchId = "";
      try {
        // Store the search and get the ID
        const search = await searchService.createSearch(
          getSearchedPostsRequest.keywords,
          user.firebaseUid,
        );
        searchId = search.id;
      } catch (error) {
        // Log error but don't fail the search operation
        console.error("Error recording search:", error);
      }

      const postsByTitle = await postRepository.searchPostsByTitle(
        getSearchedPostsRequest.keywords,
      );
      const postsByDescription = await postRepository.searchPostsByDescription(
        getSearchedPostsRequest.keywords.toLowerCase(),
      );
      const posts = postsByTitle;
      postsByDescription.forEach((pd) => {
        let contains = false;
        posts.forEach((p) => {
          if (p.id == pd.id) {
            contains = true;
            posts.splice(posts.indexOf(p), 1);
            posts.unshift(p);
          }
        });
        if (!contains) {
          posts.push(pd);
        }
      });
      const activePosts = this.filterInactiveUserPosts(posts);
      const filteredPosts = await this.filterBlockedUserPosts(
        activePosts,
        user,
      );

      return { posts: filteredPosts, searchId };
    });
  }

  public async filterPostsUnified(
    user: UserModel,
    filterPostsUnifiedRequest: FilterPostsUnifiedRequest,
    page = 1,
    limit = 10,
  ): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const skip = (page - 1) * limit;
      const posts = await postRepository.filterPostsUnified(
        filterPostsUnifiedRequest,
        skip,
        limit,
      );
      const activePosts = this.filterInactiveUserPosts(posts);
      return this.filterBlockedUserPosts(activePosts, user);
    });
  }

  public async filterPostsByCategories(
    user: UserModel,
    filterPostsRequest: FilterPostsRequest,
    page = 1,
    limit = 10,
  ): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);

      // checking null and undefined, should return empty array if so
      if (!filterPostsRequest.categories ||
        filterPostsRequest.categories.length === 0 ||
        !filterPostsRequest.categories.every(
          (cat) => typeof cat === "string" && cat.trim().length > 0,
        )
      ) {
        return [];
      }
      const skip = (page - 1) * limit;
      const posts = await postRepository.filterPostsByCategories(
        filterPostsRequest.categories,
        skip,
        limit,
      );
      const activePosts = this.filterInactiveUserPosts(posts);
      return this.filterBlockedUserPosts(activePosts, user);
    });
  }

  public async filterPostsByEventTags(user: UserModel, filterPostsByEventTagsRequest: FilterPostsByEventTagsRequest, page: number = 1, limit: number = 10): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);

      // checking null and undefined, should return empty array if so
      if (!filterPostsByEventTagsRequest.eventTags ||
        filterPostsByEventTagsRequest.eventTags.length === 0 ||
        !filterPostsByEventTagsRequest.eventTags.every(tag => typeof tag === 'string' && tag.trim().length > 0)) {
        return [];
      }
      const skip = (page - 1) * limit;
      const posts = await postRepository.filterPostsByEventTags(filterPostsByEventTagsRequest.eventTags, skip, limit);
      const activePosts = this.filterInactiveUserPosts(posts);
      return this.filterBlockedUserPosts(activePosts, user);
    });
  }

  public async filterPostsByPrice(user: UserModel, filterPostsByPriceRequest: FilterPostsByPriceRequest, page: number = 1, limit: number = 10): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const skip = (page - 1) * limit;
      const posts = await postRepository.filterPostsByPrice(
        filterPostsByPriceRequest.lowerBound,
        filterPostsByPriceRequest.upperBound,
        skip,
        limit,
      );
      const activePosts = this.filterInactiveUserPosts(posts);
      return this.filterBlockedUserPosts(activePosts, user);
    });
  }

  public async filterPriceHighToLow(
    user: UserModel,
    page = 1,
    limit = 10,
  ): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const skip = (page - 1) * limit;
      const posts = await postRepository.filterPriceHighToLow(skip, limit);
      const activePosts = this.filterInactiveUserPosts(posts);
      return this.filterBlockedUserPosts(activePosts, user);
    });
  }

  public async filterPriceLowToHigh(
    user: UserModel,
    page = 1,
    limit = 10,
  ): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const skip = (page - 1) * limit;
      const posts = await postRepository.filterPriceLowToHigh(skip, limit);
      const activePosts = this.filterInactiveUserPosts(posts);
      return this.filterBlockedUserPosts(activePosts, user);
    });
  }

  public async filterNewlyListed(
    user: UserModel,
    page = 1,
    limit = 10,
  ): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const skip = (page - 1) * limit;
      const posts = await postRepository.filterNewlyListed(skip, limit);
      const activePosts = this.filterInactiveUserPosts(posts);
      return this.filterBlockedUserPosts(activePosts, user);
    });
  }

  public async filterByCondition(
    user: UserModel,
    filterPostsByConditionRequest: FilterPostsByConditionRequest,
    page = 1,
    limit = 10,
  ): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const skip = (page - 1) * limit;
      const posts = await postRepository.filterByCondition(
        filterPostsByConditionRequest.condition,
        skip,
        limit,
      );
      const activePosts = this.filterInactiveUserPosts(posts);
      return this.filterBlockedUserPosts(activePosts, user);
    });
  }

  public async getArchivedPosts(user: UserModel): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const posts = await postRepository.getAllArchivedPosts();
      const activePosts = this.filterInactiveUserPosts(posts);
      return this.filterBlockedUserPosts(activePosts, user);
    });
  }

  public async getArchivedPostsByUserId(
    params: FirebaseUidParam,
  ): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserById(params.id);
      if (!user) throw new NotFoundError("User not found!");
      if (!user.isActive) throw new NotFoundError("User is not active!");
      const postRepository = Repositories.post(transactionalEntityManager);
      const posts = await postRepository.getArchivedPostsByUserId(params.id);
      return posts;
    });
  }

  public async archivePost(
    user: UserModel,
    params: UuidParam,
  ): Promise<PostModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(params.id);
      if (!post) throw new NotFoundError("Post not found!");
      if (post.user.isActive == false)
        throw new NotFoundError("User is not active!");
      if (user.firebaseUid != post.user?.firebaseUid)
        throw new ForbiddenError("User is not poster!");
      return await postRepository.archivePost(post);
    });
  }

  public async archiveAllPostsByUserId(
    params: FirebaseUidParam,
  ): Promise<PostModel[]> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserById(params.id);
      if (!user) throw new NotFoundError("User not found!");
      if (!user.isActive) throw new NotFoundError("User is not active!");
      const posts = await postRepository.getPostsByUserId(user.firebaseUid);
      for (const post of posts) {
        if (!post) throw new NotFoundError("Post not found!");
        await postRepository.archivePost(post);
      }
      return posts;
    });
  }

  public async getSavedPostsByUserId(user: UserModel): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const userWithSaved = await userRepository.getSavedPostsByUserId(
        user.firebaseUid,
      );
      if (!userWithSaved) throw new NotFoundError("User not found");

      const filteredPosts: PostModel[] = [];
      const postRepository = Repositories.post(transactionalEntityManager);

      for (const post of userWithSaved.saved) {
        const postAuthor = await postRepository.getUserByPostId(post.id);
        if (!postAuthor) throw new NotFoundError("Post author not found");

        // Check if the current user blocked the post author
        const isBlockedByCurrentUser =
          userWithSaved.blocking?.some(
            (blockedUser) => blockedUser.firebaseUid === postAuthor.firebaseUid,
          ) ?? false;

        if (isBlockedByCurrentUser) continue; // Skip this post immediately

        // Check if the post author blocked the current user
        const postAuthorWithBlockedInfo =
          await userRepository.getUserWithBlockedInfo(postAuthor.firebaseUid);
        const isBlockedByPostAuthor =
          postAuthorWithBlockedInfo?.blocking?.some(
            (blockedUser) => blockedUser.firebaseUid === user.firebaseUid,
          ) ?? false;

        // Include the post if there's no blocking in either direction
        if (!isBlockedByPostAuthor) {
          filteredPosts.push(post);
        }
      }

      return filteredPosts;
    });
  }

  public async savePost(
    user: UserModel,
    params: UuidParam,
  ): Promise<PostModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(params.id);
      if (!post) throw new NotFoundError("Post not found!");
      if (post.user.isActive == false)
        throw new NotFoundError("User is not active!");
      const userRepository = Repositories.user(transactionalEntityManager);
      const postOwner = await userRepository.getUserById(post.user.firebaseUid);
      if (!postOwner) throw new NotFoundError("Post owner not found!");
      const bookmarkNotifRequest: FindTokensRequest = {
        email: postOwner.email,
        title: "Bookmark Listing Notification",
        body: user.username + " bookmarked your listing!",
        data: {
          postId: post.id,
          postTitle: post.title,
          bookmarkedBy: user.firebaseUid,
          bookmarkedByUsername: user.username,
        } as unknown as JSON,
      };
      const notifService = new NotifService(transactionalEntityManager);
      await notifService.sendNotifs(bookmarkNotifRequest);
      return await userRepository.savePost(user, post);
    });
  }

  public async unsavePost(
    user: UserModel,
    params: UuidParam,
  ): Promise<PostModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(params.id);
      if (!post) throw new NotFoundError("Post not found!");
      if (post.user.isActive == false)
        throw new NotFoundError("User is not active!");
      const userRepository = Repositories.user(transactionalEntityManager);
      return await userRepository.unsavePost(user, post);
    });
  }

  public async isSavedPost(
    user: UserModel,
    params: UuidParam,
  ): Promise<boolean> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(params.id);
      if (!post) throw new NotFoundError("Post not found!");
      const userRepository = Repositories.user(transactionalEntityManager);
      return await userRepository.isSavedPost(user, post);
    });
  }

  public async editPostPrice(
    user: UserModel,
    params: UuidParam,
    editPostRequest: EditPostPriceRequest,
  ): Promise<PostModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(params.id);
      if (!post) throw new NotFoundError("Post not found!");
      return await postRepository.editPostPrice(
        post,
        editPostRequest.newPrice,
      );
    });
  }

  public async addEventTagsToPost(user: UserModel, params: UuidParam, addEventTagsRequest: AddEventTagsToPostRequest): Promise<PostModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(params.id);
      if (!post) throw new NotFoundError('Post not found!');
      if (user.firebaseUid !== post.user?.firebaseUid) throw new ForbiddenError('User is not the post owner!');

      const eventTagRepository = Repositories.eventTag(transactionalEntityManager);
      const eventTags = await eventTagRepository.findOrCreateByNames(addEventTagsRequest.eventTags);

      // Add new event tags to existing ones
      const existingEventTagIds = new Set(post.eventTags?.map(tag => tag.id) || []);
      const newEventTags = eventTags.filter(tag => !existingEventTagIds.has(tag.id));
      post.eventTags = [...(post.eventTags || []), ...newEventTags];

      return await postRepository.savePost(post);
    });
  }

  public async removeEventTagsFromPost(user: UserModel, params: UuidParam, removeEventTagsRequest: RemoveEventTagsFromPostRequest): Promise<PostModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(params.id);
      if (!post) throw new NotFoundError('Post not found!');
      if (user.firebaseUid !== post.user?.firebaseUid) throw new ForbiddenError('User is not the post owner!');

      const tagsToRemove = new Set(removeEventTagsRequest.eventTags);
      post.eventTags = post.eventTags?.filter(tag => !tagsToRemove.has(tag.name)) || [];

      return await postRepository.savePost(post);
    });
  }

  /**
   * Get suggested posts for a user based on their search history, purchase history, and bookmarks
   * Uses a weighted scoring system to prioritize posts that are:
   * 1. Recent (decay based on time)
   * 2. Matches the user's search history (+1 point)
   * 3. Matches the user's purchase history categories (+2 points)
   * 4. Bookmarked by the user (+3 points)
   */
  public async getSuggestedPosts(
    user: UserModel,
    limit = 10,
  ): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const suggestedPosts = await postRepository.getSuggestedPosts(
        user.firebaseUid,
        limit,
      );

      // Taking out posts from inactive/blocked users
      const activePosts = this.filterInactiveUserPosts(suggestedPosts);
      return this.filterBlockedUserPosts(activePosts, user);
    });
  }

  /**
   * Returns the 4 closest similar posts by embedding (active, unsold only).
   * If no similar posts (e.g. few posts, or only current user's posts), returns
   * up to 4 other active posts as a fallback so the UI isn't empty.
   */
  public async similarPosts(
    user: UserModel,
    params: UuidParam,
  ): Promise<PostModel[]> {
    const SIMILAR_COUNT = 4;
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(params.id);
      if (!post) throw new NotFoundError("Post not found!");
      const embedding = post.embedding;

      if (embedding == null) {
        let fallback = await postRepository.getSimilarPostsFallback(
          post.id,
          user.firebaseUid,
          SIMILAR_COUNT,
        );
        if (fallback.length === 0) {
          fallback = await postRepository.getSimilarPostsFallbackIncludeSameUser(
            post.id,
            SIMILAR_COUNT,
          );
        }
        const active = this.filterInactiveUserPosts(fallback);
        return (await this.filterBlockedUserPosts(active, user)).slice(
          0,
          SIMILAR_COUNT,
        );
      }

      const similarPosts = await postRepository.getSimilarPosts(
        embedding,
        post.id,
        user.firebaseUid,
        20,
      );
      const activePosts = this.filterInactiveUserPosts(similarPosts);
      const filtered = await this.filterBlockedUserPosts(activePosts, user);
      const result = filtered.slice(0, SIMILAR_COUNT);

      if (result.length === 0) {
        let fallback = await postRepository.getSimilarPostsFallback(
          post.id,
          user.firebaseUid,
          SIMILAR_COUNT,
        );
        if (fallback.length === 0) {
          fallback = await postRepository.getSimilarPostsFallbackIncludeSameUser(
            post.id,
            SIMILAR_COUNT,
          );
        }
        const active = this.filterInactiveUserPosts(fallback);
        return (await this.filterBlockedUserPosts(active, user)).slice(
          0,
          SIMILAR_COUNT,
        );
      }

      return result;
    });
  }

  public filterInactiveUserPosts(posts: PostModel[]): PostModel[] {
    if (!posts || !Array.isArray(posts)) {
      return [];
    }
    return posts.filter((post) => post.user?.isActive);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private similarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error("Vectors must have the same length");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0; // Handle zero vectors
    }

    return dotProduct / (normA * normB);
  }

  public async filterBlockedUserPosts(
    posts: PostModel[],
    user: UserModel,
  ): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const userWithBlockedInfo = await userRepository.getUserWithBlockedInfo(
        user.firebaseUid,
      );
      const blockedUsers = userWithBlockedInfo?.blocking;

      // checking null and undefined, should return empty array
      if (!posts || !Array.isArray(posts)) {
        return [];
      }

      return posts.filter((post) => {
        if (blockedUsers) {
          for (const blockedUser of blockedUsers) {
            if (post.user?.firebaseUid == blockedUser.firebaseUid) return false;
          }
        }
        return true;
      });
    });
  }

  /**
   * Get search suggestions based on vector similarity to a search's embedding
   * Returns only post IDs, not full post data.
   */
  public async getSearchSuggestions(
    searchIndex: string,
    postCount: number,
  ): Promise<string[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const searchRepository = Repositories.search(transactionalEntityManager);
      const postRepository = Repositories.post(transactionalEntityManager);
      // Get the search by ID
      const search = await searchRepository.getSearchById(searchIndex);
        if (!search) throw new NotFoundError('Search not found!');
        // Parse search vector
        const searchVector: number[] = JSON.parse(search.searchVector);
        // Get active, unarchived posts
        const allPosts = await postRepository.getAllPosts();
      const postsWithEmbeddings = allPosts.filter(p => p.embedding != null);
      
      if (postsWithEmbeddings.length === 0) {
        return [];
      }
      // Use precomputed embeddings from db
      const scoredPosts = postsWithEmbeddings.map(post => ({
          id: post.id,
        similarity: this.similarity(searchVector, post.embedding as number[])
        }));
        // Sort by similarity (descending order) and choose top N
        const topPosts = scoredPosts.sort((a, b) => b.similarity - a.similarity).slice(0, postCount);
        return topPosts.map(p => p.id);
    });
  }

  /**
   * Get purchase suggestions based on vector similarity to user's purchase history
   * Returns only post IDs, not full post data.
   */
  public async getPurchaseSuggestions(
    user: UserModel,
    limit = 10,
  ): Promise<string[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const transactionRepository = Repositories.transaction(
        transactionalEntityManager,
      );
      const postRepository = Repositories.post(transactionalEntityManager);

      // Get user's purchase history (completed transactions where user is buyer)
      const userTransactions =
        await transactionRepository.getTransactionsByBuyerId(user.firebaseUid);
      const completedTransactions = userTransactions.filter((t) => t.completed);

      // If user hasn't bought anything, return empty array
      if (completedTransactions.length === 0) {
        return [];
      }

      // Extract posts from completed transactions
      const purchasedPosts = completedTransactions
        .map((t) => t.post)
        .filter((p) => p != null && p.embedding != null);
      if (purchasedPosts.length === 0) {
        return [];
      }

      // Use existing embeddings from purchased posts
      const purchaseEmbeddings = purchasedPosts.map(
        (p) => p.embedding as number[],
      );

      // Calculate average embedding vector from all purchases
      const avgEmbedding = new Array(purchaseEmbeddings[0].length).fill(0);
      for (const embedding of purchaseEmbeddings) {
        for (let i = 0; i < embedding.length; i++) {
          avgEmbedding[i] += embedding[i];
        }
      }
      for (let i = 0; i < avgEmbedding.length; i++) {
        avgEmbedding[i] /= purchaseEmbeddings.length;
      }

      // Use database vector similarity search
      const similarPosts = await postRepository.getPurchaseSuggestions(
        avgEmbedding,
        user.firebaseUid,
        limit,
      );
      return similarPosts.map((p) => p.id);
    });
  }
}
