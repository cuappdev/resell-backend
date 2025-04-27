import { Tensor2D } from '@tensorflow/tfjs';
import { ForbiddenError, NotFoundError } from 'routing-controllers';
import { Service } from 'typedi';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';

import { UuidParam, FirebaseUidParam } from '../api/validators/GenericRequests';
import { PostModel } from '../models/PostModel';
import { UserModel } from '../models/UserModel';
import Repositories, { TransactionsManager } from '../repositories';
import { CreatePostRequest, FilterPostsRequest, FilterPostsByPriceRequest, FilterPostsByConditionRequest, GetSearchedPostsRequest, EditPostPriceRequest, FilterPostsUnifiedRequest } from '../types';
import { uploadImage } from '../utils/Requests';
// import { encoder } from '../app';
import { PostRepository } from 'src/repositories/PostRepository';
import { CategoryRepository } from 'src/repositories/CategoryRepository';
import { FindTokensRequest } from '../types';
import { NotifService } from './NotifService';
import { SearchService } from './SearchService'; // Import SearchService
import pgvector from 'pgvector'
import { getLoadedModel } from '../utils/SentenceEncoder';
//require('@tensorflow-models/universal-sentence-encoder')

@Service() 
export class PostService {
  private transactions: TransactionsManager;
  
  constructor(@InjectManager() entityManager: EntityManager) {
    this.transactions = new TransactionsManager(entityManager);
  }

  public parseEmbedding(embeddingStr: string): number[] {
    try {
      return JSON.parse(embeddingStr);
    } catch (error) {
      console.error("Error parsing embedding:", error);
      return [];
    }
  }

  public async getAllPosts(user: UserModel, page: number, limit: number): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const skip = (page - 1) * limit;
      const activeUserPosts = this.filterInactiveUserPosts(await postRepository.getAllPostsPaginated(skip,limit));
      return this.filterBlockedUserPosts(activeUserPosts, user);
    });
  }

  public async getPostById(user: UserModel, params: UuidParam): Promise<PostModel> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(params.id);
      if (!post) throw new NotFoundError('Post not found!');
      if (!post.user?.isActive) throw new NotFoundError('User is not active!');
      const postUnblocked = await this.filterBlockedUserPosts([post], user);
      if (postUnblocked.length == 0) throw new ForbiddenError('User is blocked!');
      return post;
    });
  }

  public async getPostsByUserId(currentUser: UserModel, params: FirebaseUidParam): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const userPosts = await postRepository.getPostsByUserId(params.id);
      return this.filterBlockedUserPosts(userPosts, currentUser);
    });
  }

  public async createPost(post: CreatePostRequest): Promise<PostModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserById(post.userId);
      if (!user) throw new NotFoundError('User not found!');
      if (!user.isActive) throw new NotFoundError('User is not active!');
      const postRepository = Repositories.post(transactionalEntityManager);
      const images: string[] = [];
      for (const imageBase64 of post.imagesBase64) {
        const image = await uploadImage(imageBase64);
        const imageUrl = image.data;
        images.push(imageUrl);
      }
      const categoryRepository = Repositories.category(transactionalEntityManager);
      const categories = await categoryRepository.findOrCreateByNames(post.categories);
      let embedding = null;
      try {
        const model = await getLoadedModel();
        const sentence = `${post.title} ${post.description}`;
        const sentences = [sentence];
        const embeddingTensor = await model.embed(sentences);
        const embeddingArray = await embeddingTensor.array();
        embedding = embeddingArray[0];
      } catch (error) {
        console.error("Error computing embedding:", error);
      }
      const freshPost = await postRepository.createPost(post.title, post.description, categories, post.condition, post.original_price, images, user, embedding);
      console.log("Post created");
      if (embedding) {
        const requestRepository = Repositories.request(transactionalEntityManager);
        // TODO: how many should we get?
        const similarRequests = await requestRepository.findSimilarRequests(embedding, 10);
        for (const request of similarRequests) {
          await requestRepository.addMatchToRequest(request, freshPost);
        }
      }
  
      return freshPost;
    });
  }

  public async deletePostById(user: UserModel, params: UuidParam): Promise<PostModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(params.id);
      if (!post) throw new NotFoundError('Post not found!');
      if (user.firebaseUid != post.user?.firebaseUid && !user.admin) throw new ForbiddenError('User is not poster!');
      return postRepository.deletePost(post);
    });
  }

  public async searchPosts(user: UserModel, getSearchedPostsRequest: GetSearchedPostsRequest): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      
      // Record the search in the searches table
      const searchService = new SearchService();
      try {
        // Store the search asynchronously to not block the search results
        searchService.createSearch(getSearchedPostsRequest.keywords, user.firebaseUid)
          .catch(error => console.error("Error recording search:", error));
      } catch (error) {
        // Log error but don't fail the search operation
        console.error("Error initiating search recording:", error);
      }
      
      const postsByTitle = await postRepository.searchPostsByTitle(getSearchedPostsRequest.keywords);
      const postsByDescription = await postRepository.searchPostsByDescription(getSearchedPostsRequest.keywords.toLowerCase());
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
      let activePosts = this.filterInactiveUserPosts(posts);
      return this.filterBlockedUserPosts(activePosts, user);
    });
  }

  public async filterPostsUnified(user: UserModel, filterPostsUnifiedRequest: FilterPostsUnifiedRequest): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const posts = await postRepository.filterPostsUnified(filterPostsUnifiedRequest);
      const activePosts = this.filterInactiveUserPosts(posts);
      return this.filterBlockedUserPosts(activePosts, user);
    });
  }


  public async filterPostsByCategories(user: UserModel, filterPostsRequest: FilterPostsRequest): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const posts = await postRepository.filterPostsByCategories(filterPostsRequest.categories);
      const activePosts = this.filterInactiveUserPosts(posts);
      return this.filterBlockedUserPosts(activePosts, user);
    });
  }

  public async filterPostsByPrice(user: UserModel, filterPostsByPriceRequest: FilterPostsByPriceRequest): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const posts = await postRepository.filterPostsByPrice(filterPostsByPriceRequest.lowerBound, filterPostsByPriceRequest.upperBound)
      const activePosts = this.filterInactiveUserPosts(posts);
      return this.filterBlockedUserPosts(activePosts, user);
    })
  }

  public async filterPriceHighToLow(user: UserModel): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const posts = await postRepository.filterPriceHighToLow();
      const activePosts = this.filterInactiveUserPosts(posts);
      return this.filterBlockedUserPosts(activePosts, user);
    });
  }
  
  public async filterPriceLowToHigh(user: UserModel): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const posts = await postRepository.filterPriceLowToHigh();
      const activePosts = this.filterInactiveUserPosts(posts);
      return this.filterBlockedUserPosts(activePosts, user);
    });
  }

  public async filterNewlyListed(user: UserModel): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const posts = await postRepository.filterNewlyListed();
      const activePosts = this.filterInactiveUserPosts(posts);
      return this.filterBlockedUserPosts(activePosts, user);
    });
  }

  public async filterByCondition(user: UserModel, filterPostsByConditionRequest: FilterPostsByConditionRequest): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const posts = await postRepository.filterByCondition(filterPostsByConditionRequest.condition);
      const activePosts = this.filterInactiveUserPosts(posts);
      return this.filterBlockedUserPosts(activePosts, user);
    });
  }


  public async getArchivedPosts(user: UserModel): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const posts = await postRepository.getArchivedPosts();
      const activePosts = this.filterInactiveUserPosts(posts);
      return this.filterBlockedUserPosts(activePosts, user);
    });
  }

  public async getArchivedPostsByUserId(params: FirebaseUidParam): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserById(params.id)
      if (!user) throw new NotFoundError('User not found!');
      if (!user.isActive) throw new NotFoundError('User is not active!');
      const postRepository = Repositories.post(transactionalEntityManager);
      const posts = await postRepository.getArchivedPostsByUserId(params.id);
      return posts;
    });
  }

  public async archivePost(user: UserModel, params: UuidParam): Promise<PostModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(params.id);
      if (!post) throw new NotFoundError('Post not found!');
      if (post.user.isActive == false) throw new NotFoundError('User is not active!');
      if (user.firebaseUid != post.user?.firebaseUid) throw new ForbiddenError('User is not poster!');
      return await postRepository.archivePost(post);
    });
  }

  public async archiveAllPostsByUserId(params: FirebaseUidParam): Promise<PostModel[]> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserById(params.id)
      if (!user) throw new NotFoundError('User not found!');
      if (!user.isActive) throw new NotFoundError('User is not active!');
      const posts = await postRepository.getPostsByUserId(user.firebaseUid);
      for (const post of posts) {
        if (!post) throw new NotFoundError('Post not found!');
        await postRepository.archivePost(post);
      }
      return posts;
    });
  }

  public async getSavedPostsByUserId(user: UserModel): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const userWithSaved = await userRepository.getSavedPostsByUserId(user.firebaseUid);
      if (!userWithSaved) throw new NotFoundError('User not found');
  
      const filteredPosts: PostModel[] = [];
      const postRepository = Repositories.post(transactionalEntityManager);
  
      for (const post of userWithSaved.saved) {
        const postAuthor = await postRepository.getUserByPostId(post.id);
        if (!postAuthor) throw new NotFoundError('Post author not found');
  
        // Check if the current user blocked the post author
        const isBlockedByCurrentUser = userWithSaved.blocking?.some(
          blockedUser => blockedUser.firebaseUid === postAuthor.firebaseUid
        ) ?? false;
  
        if (isBlockedByCurrentUser) continue; // Skip this post immediately
  
        // Check if the post author blocked the current user
        const postAuthorWithBlockedInfo = await userRepository.getUserWithBlockedInfo(postAuthor.firebaseUid);
        const isBlockedByPostAuthor = postAuthorWithBlockedInfo?.blocking?.some(
          blockedUser => blockedUser.firebaseUid === user.firebaseUid
        ) ?? false;
  
        // Include the post if there's no blocking in either direction
        if (!isBlockedByPostAuthor) {
          filteredPosts.push(post);
        }
      }
  
      return filteredPosts;
    });
  }
  

  public async savePost(user: UserModel, params: UuidParam): Promise<PostModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(params.id);
      if (!post) throw new NotFoundError('Post not found!');
      if (post.user.isActive == false) throw new NotFoundError('User is not active!');
      const userRepository = Repositories.user(transactionalEntityManager);
      const postOwner = await userRepository.getUserById(post.user.firebaseUid);
      if (!postOwner) throw new NotFoundError('Post owner not found!');
      const bookmarkNotifRequest: FindTokensRequest = {
        email: postOwner.email,
        title: "Bookmark Listing Notification",
        body: user.username + " bookmarked your listing!",
        data: {
          postId: post.id,
          postTitle: post.title,
          bookmarkedBy: user.firebaseUid,
          bookmarkedByUsername: user.username
        } as unknown as JSON
      }
      const notifService = new NotifService(transactionalEntityManager);
      await notifService.sendNotifs(bookmarkNotifRequest);
      return await userRepository.savePost(user, post);
    });
  }

  public async unsavePost(user: UserModel, params: UuidParam): Promise<PostModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(params.id);
      if (!post) throw new NotFoundError('Post not found!');
      if (post.user.isActive == false) throw new NotFoundError('User is not active!');
      const userRepository = Repositories.user(transactionalEntityManager);
      return await userRepository.unsavePost(user, post);
    });
  }

  public async isSavedPost(user: UserModel, params: UuidParam): Promise<boolean> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(params.id);
      if (!post) throw new NotFoundError('Post not found!');
      const userRepository = Repositories.user(transactionalEntityManager);
      return await userRepository.isSavedPost(user, post);
    });
  }

  public async editPostPrice(user: UserModel, params: UuidParam, editPostRequest: EditPostPriceRequest): Promise<PostModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(params.id);
      if (!post) throw new NotFoundError('Post not found!');
      return await postRepository.editPostPrice(post, editPostRequest.new_price);
    })
  }

  /**
   * Get suggested posts for a user based on their search history, purchase history, and bookmarks
   * Uses a weighted scoring system to prioritize posts that are:
   * 1. Recent (decay based on time)
   * 2. Matches the user's search history (+1 point)
   * 3. Matches the user's purchase history categories (+2 points)
   * 4. Bookmarked by the user (+3 points)
   */
  public async getSuggestedPosts(user: UserModel, limit: number = 10): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const suggestedPosts = await postRepository.getSuggestedPosts(user.firebaseUid, limit);
      
      // Taking out posts from inactive/blocked users
      const activePosts = this.filterInactiveUserPosts(suggestedPosts);
      return this.filterBlockedUserPosts(activePosts, user);
    });
  }

  public similarity(a: Array<number>, b: Array<number>): number {
    var magnitudeA = Math.sqrt(this.dotProduct(a, a));
    var magnitudeB = Math.sqrt(this.dotProduct(b, b));
    if (magnitudeA && magnitudeB)
      return this.dotProduct(a, b) / (magnitudeA * magnitudeB);
    else return 0;
  }

  public dotProduct(a: Array<number>, b: Array<number>) {
    const result = a.reduce((acc, cur, index)=>{
      acc += (cur * b[index]);
      return acc;
    }, 0);
    return result;
  }

  public async similarPosts(user: UserModel, params: UuidParam): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(params.id);
      if (!post) throw new NotFoundError('Post not found!');
      const embedding = post.embedding
      const similarPosts = await postRepository.getSimilarPosts(embedding, post.id);
      const activePosts = this.filterInactiveUserPosts(similarPosts);
      return this.filterBlockedUserPosts(activePosts, user);
    });
  }

  public filterInactiveUserPosts(posts: PostModel[]): PostModel[] {
    return posts.filter((post) => post.user?.isActive);
  }

  public async filterBlockedUserPosts(posts: PostModel[], user: UserModel): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const userWithBlockedInfo = await userRepository.getUserWithBlockedInfo(user.firebaseUid);
      const blockedUsers = userWithBlockedInfo?.blocking;
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
}
