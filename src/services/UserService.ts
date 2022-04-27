import { NotFoundError } from 'routing-controllers';
import { PostAndUserUuidParam } from 'src/api/validators/GenericRequests';
import { PostModel } from 'src/models/PostModel';
import { Service } from 'typedi';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';

import { UserModel } from '../models/UserModel';
import Repositories, { TransactionsManager } from '../repositories';
import { EditProfileRequest, Uuid } from '../types';
import { uploadImage } from '../utils/Requests';

@Service()
export class UserService {
  private transactions: TransactionsManager;

  constructor(@InjectManager() entityManager: EntityManager) {
    this.transactions = new TransactionsManager(entityManager);
  }

  public async getAllUsers(): Promise<UserModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      return userRepository.getAllUsers();
    });
  }

  public async getUserById(id: Uuid): Promise<UserModel> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserById(id);
      if (!user) throw new NotFoundError('User not found!');
      return user;
    });
  }

  public async getUserByGoogleId(googleId: Uuid): Promise<UserModel> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserByGoogleId(googleId);
      if (!user) throw new NotFoundError('User not found!');
      return user;
    });
  }

  public async getUserByPostId(id: Uuid): Promise<UserModel> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const user = await postRepository.getUserByPostId(id);
      if (!user) throw new NotFoundError('Post not found!');
      return user;
    });
  }

  public async savePost(params: PostAndUserUuidParam): Promise<PostModel> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserById(params.userId);
      if (!user) throw new NotFoundError('User not found!');
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(params.postId);
      if (!post) throw new NotFoundError('Post not found!');
      await userRepository.savePost(user, post);
      return post
    });
  }

  public async unsavePost(params: PostAndUserUuidParam): Promise<PostModel> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserById(params.userId);
      if (!user) throw new NotFoundError('User not found!');
      const postRepository = Repositories.post(transactionalEntityManager);
      const post = await postRepository.getPostById(params.postId);
      if (!post) throw new NotFoundError('Post not found!');
      await userRepository.unsavePost(user, post);
      return post
    });
  }

  public async getUserByEmail(email: string): Promise<UserModel> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserByEmail(email);
      if (!user) throw new NotFoundError('User not found!');
      return user;
    });
  }

  public async updateUser(editProfileRequest: EditProfileRequest, user: UserModel): Promise<UserModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      let imageUrl = undefined;
      if (editProfileRequest.photoUrl_base64) {
        const image = await uploadImage(editProfileRequest.photoUrl_base64);
        imageUrl = image.data;
      }
      return userRepository.updateUser(user, editProfileRequest.username, imageUrl,
        editProfileRequest.venmoHandle, editProfileRequest.bio);
    });
  }
}