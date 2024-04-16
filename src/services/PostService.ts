import { Tensor2D } from '@tensorflow/tfjs';
import { ForbiddenError, NotFoundError } from 'routing-controllers';
import { Service } from 'typedi';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';

import { UuidParam } from '../api/validators/GenericRequests';
import { PostModel } from '../models/PostModel';
import { UserModel } from '../models/UserModel';
import Repositories, { TransactionsManager } from '../repositories';
import { CreatePostRequest, FilterPostsRequest, FilterPostsByPriceRequest, GetSearchedPostsRequest, EditPostPriceRequest } from '../types';
import { uploadImage } from '../utils/Requests';
import { getLoadedModel } from '../utils/SentenceEncoder';
require('@tensorflow-models/universal-sentence-encoder')

@Service() 
export class PostService {
  private transactions: TransactionsManager;

  constructor(@InjectManager() entityManager: EntityManager) {
    this.transactions = new TransactionsManager(entityManager);
  }

  public async getAllPosts(): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      // filter out posts from inactive users
      return (await postRepository.getAllPosts()).filter((post) => post.user?.isActive);
    });
  }

  public async getPostById(params: UuidParam): Promise<PostModel> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(params.id);
      if (!post) throw new NotFoundError('Post not found!');
      if (!post.user?.isActive) throw new NotFoundError('User is not active!');
      return post;
    });
  }

  public async getPostsByUserId(params: UuidParam): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserById(params.id)
      if (!user) throw new NotFoundError('User not found!');
      if (!user.isActive) throw new NotFoundError('User is not active!');
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
      if (!user.isActive) throw new NotFoundError('User is not active!');
      const postRepository = Repositories.post(transactionalEntityManager);
      const images: string[] = [];
      for (const imageBase64 of post.imagesBase64) {
        const image = await uploadImage(imageBase64);
        const imageUrl = image.data;
        images.push(imageUrl);
      }
      const freshPost = await postRepository.createPost(post.title, post.description, post.categories, post.original_price, images, user);
      const requestRepository = Repositories.request(transactionalEntityManager);
      const requests = await requestRepository.getAllRequest();
      for (const request of requests) {
        const model = await getLoadedModel();
        const sentences = [
          post.title,
          request.title
        ];
        await model.embed(sentences).then(async (embeddings: any) => {
          embeddings = embeddings.arraySync()
          const a = embeddings[0];
          const b = embeddings[1];

          if (this.similarity(a, b) >= 0.5) {
            await requestRepository.addMatchToRequest(request, freshPost);
          }
        });
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
      return posts.filter((post) => post.user?.isActive);
    });
  }

  public async filterPosts(filterPostsRequest: FilterPostsRequest): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const posts = await postRepository.filterPosts(filterPostsRequest.category);
      return posts.filter((post) => post.user?.isActive);
    });
  }

  public async filterPostsByPrice(filterPostsByPriceRequest: FilterPostsByPriceRequest): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const posts = await postRepository.filterPostsByPrice(filterPostsByPriceRequest.lowerBound, filterPostsByPriceRequest.upperBound)
      return posts.filter((post) => post.user?.isActive);
    })
  }

  public async getArchivedPosts(): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      return (await postRepository.getArchivedPosts()).filter((post) => post.user?.isActive);
    });
  }

  public async getArchivedPostsByUserId(params: UuidParam): Promise<PostModel[]> {
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
      if (post.user.isActive == false) throw new NotFoundError('User is not active!');
      const userRepository = Repositories.user(transactionalEntityManager);
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

  public async similarPosts(params: UuidParam): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(params.id);
      if (!post) throw new NotFoundError('Post not found!');
      const allPosts = await postRepository.getAllPosts();
      let posts: PostModel[] = []
      const model = await getLoadedModel();
      for (const p of allPosts) {
        if (post.id != p.id) {
          const sentences = [
            post.title,
            p.title
          ];
          await model.embed(sentences).then(async (embeddings: any) => {
            embeddings = embeddings.arraySync()
            const a = embeddings[0];
            const b = embeddings[1];
            if (this.similarity(a, b) >= 0.5) {
              posts.push(p)
            }
          });
        }
      }
      return posts.filter((post) => post.user?.isActive);
    });
  }
}

