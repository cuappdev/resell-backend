import { NotFoundError, UnauthorizedError } from 'routing-controllers';
import { Service } from 'typedi';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';

import { UuidParam } from '../api/validators/GenericRequests';
import { UserModel } from '../models/UserModel';
import Repositories, { TransactionsManager } from '../repositories';
import { EditProfileRequest, SetAdminByEmailRequest } from '../types';
import { uploadImage } from '../utils/Requests';

@Service()
export class UserService {
  private transactions: TransactionsManager;

  constructor(@InjectManager() entityManager: EntityManager) {
    this.transactions = new TransactionsManager(entityManager);
  }

  public async getAllUsers(user: UserModel): Promise<UserModel[]> {
    // if (!user.admin) throw new UnauthorizedError('User does not have permission to get all users')
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      return userRepository.getAllUsers();
    });
  }

  public async getUserById(params: UuidParam): Promise<UserModel> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserById(params.id);
      if (!user) throw new NotFoundError('User not found!');
      return user;
    });
  }

  public async getUserByGoogleId(id: string): Promise<UserModel> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserByGoogleId(id);
      if (!user) throw new NotFoundError('User not found!');
      return user;
    });
  }

  public async getUserByPostId(params: UuidParam): Promise<UserModel> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const user = await postRepository.getUserByPostId(params.id);
      if (!user) throw new NotFoundError('Post not found!');
      return user;
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
      if (editProfileRequest.photoUrlBase64) {
        const image = await uploadImage(editProfileRequest.photoUrlBase64);
        imageUrl = image.data;
      }
      return userRepository.updateUser(user, editProfileRequest.username, imageUrl,
        editProfileRequest.venmoHandle, editProfileRequest.bio);
    });
  }

  public async setAdmin(superAdmin: UserModel, setAdminByEmailRequest: SetAdminByEmailRequest): Promise<UserModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const adminEmails = process.env.ADMIN_EMAILS?.split(",");
      if (!adminEmails?.includes(superAdmin.email)) {
        throw new UnauthorizedError('Only super admin can set admin status!');
      }
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserByEmail(setAdminByEmailRequest.email)
      if (!user) throw new NotFoundError('User not found!');
      return await userRepository.setAdmin(user, setAdminByEmailRequest.status);
    });
  }
}