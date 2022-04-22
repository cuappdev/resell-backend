import { NotFoundError } from 'routing-controllers';
import { Service } from 'typedi';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';

import { PostModel } from '../models/PostModel';
import Repositories, { TransactionsManager } from '../repositories';
import { CreatePostRequest, GetSearchedPostsRequest, FilterPostsRequest, Uuid } from '../types';
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
      return postRepository.getAllPosts();
    });
  }

  public async getPostById(id: Uuid): Promise<PostModel> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(id);
      if (!post) throw new NotFoundError('Post not found!');
      return post;
    });
  }

  public async getPostsByUserId(userId: Uuid): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const posts = await postRepository.getPostsByUserId(userId);
      if (!posts) throw new NotFoundError('User not found!');
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
      for (const image_base64 of post.images_base64) {
        const image = await uploadImage(image_base64);
        const imageUrl = image.data;
        images.push(imageUrl);
      }
      return postRepository.createPost(post.title, post.description, post.categories, post.price, images, user);
    });
  }

  public async deletePostById(id: Uuid): Promise<PostModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(id);
      if (!post) throw new NotFoundError('Post not found!');
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
          if (p.id == pd.id)
          {
            contains=true;
            posts.splice(posts.indexOf(p), 1);
            posts.unshift(p);
          }
        });
        if (!contains)
        {
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
}