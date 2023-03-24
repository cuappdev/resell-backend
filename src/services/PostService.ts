import { ForbiddenError, NotFoundError } from 'routing-controllers';
import { Service } from 'typedi';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';

import { UuidParam } from '../api/validators/GenericRequests';
import { PostModel } from '../models/PostModel';
import { UserModel } from '../models/UserModel';
import Repositories, { TransactionsManager } from '../repositories';
import { CreatePostRequest, EditPostPriceRequest, FilterPostsRequest, GetSearchedPostsRequest } from '../types';
import { uploadImage } from '../utils/Requests';

@Service()
export class PostService {
  private transactions: TransactionsManager;

  constructor(@InjectManager() entityManager: EntityManager) {
    this.transactions = new TransactionsManager(entityManager);
  }

  public async getAllPosts(): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      return await postRepository.getAllPosts();
    });
  }

  public async getPostById(params: UuidParam): Promise<PostModel> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(params.id);
      if (!post) throw new NotFoundError('Post not found!');
      return post;
    });
  }

  public async getPostsByUserId(params: UuidParam): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserById(params.id)
      if (!user) throw new NotFoundError('User not found!');
      const postRepository = Repositories.post(transactionalEntityManager);
      const posts = await postRepository.getPostsByUserId(params.id);
      return posts;
    });
  }

  public async createPost(post: CreatePostRequest): Promise<PostModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserById(post.userId);
      if (!user) throw new NotFoundError('User not found!');
      const postRepository = Repositories.post(transactionalEntityManager);
      const images: string[] = [];
      for (const imageBase64 of post.imagesBase64) {
        const image = await uploadImage(imageBase64);
        const imageUrl = image.data;
        images.push(imageUrl);
      }
      const freshPost = await postRepository.createPost(post.title, post.description, post.categories, post.original_price, images, user);
      var stringSimilarity = require("string-similarity");
      const requestRepository = Repositories.request(transactionalEntityManager);
      const requests = await requestRepository.getAllRequest();
      for (const r of requests) {
        let similarity = stringSimilarity.compareTwoStrings(post.title, r.title);
        if (similarity >= 0.4) {
          await requestRepository.addMatchToRequest(r, freshPost)
        }
      }
      return freshPost
    });
  }

  public async deletePostById(user: UserModel, params: UuidParam): Promise<PostModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(params.id);
      if (!post) throw new NotFoundError('Post not found!');
      if (user.id != post.user?.id && !user.admin) throw new ForbiddenError('User is not poster!');
      return postRepository.deletePost(post);
    });
  }

  public async searchPosts(getSearchedPostsRequest: GetSearchedPostsRequest): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
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
      return posts;
    });
  }

  public async filterPosts(filterPostsRequest: FilterPostsRequest): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const posts = await postRepository.filterPosts(filterPostsRequest.category);
      return posts;
    });
  }

  public async getArchivedPosts(): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      return await postRepository.getArchivedPosts();
    });
  }

  public async getArchivedPostsByUserId(params: UuidParam): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserById(params.id)
      if (!user) throw new NotFoundError('User not found!');
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
      if (user.id != post.user?.id) throw new ForbiddenError('User is not poster!');
      return await postRepository.archivePost(post);
    });
  }

  public async getSavedPostsByUserId(user: UserModel): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const userWithSaved = await userRepository.getSavedPostsByUserId(user.id);
      if (!userWithSaved) throw new NotFoundError('Easter egg')
      return userWithSaved.saved;
    });
  }

  public async savePost(user: UserModel, params: UuidParam): Promise<PostModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(params.id);
      if (!post) throw new NotFoundError('Post not found!');
      const userRepository = Repositories.user(transactionalEntityManager);
      return await userRepository.savePost(user, post);
    });
  }

  public async unsavePost(user: UserModel, params: UuidParam): Promise<PostModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(params.id);
      if (!post) throw new NotFoundError('Post not found!');
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
}
