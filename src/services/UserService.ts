import { NotFoundError, UnauthorizedError } from 'routing-controllers';
import { Service } from 'typedi';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';

import { UuidParam } from '../api/validators/GenericRequests';
import { UserModel } from '../models/UserModel';
import Repositories, { TransactionsManager } from '../repositories';
import { EditProfileRequest, SaveTokenRequest, SetAdminByEmailRequest, BlockUserRequest, UnblockUserRequest, CreateUserRequest, FcmToken } from '../types';
import { uploadImage } from '../utils/Requests';

@Service()
export class UserService {
  private transactions: TransactionsManager;

  constructor(@InjectManager() entityManager: EntityManager) {
    this.transactions = new TransactionsManager(entityManager);
  }

  public async createUser(user: UserModel, createUserRequest: CreateUserRequest): Promise<UserModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      return await userRepository.createUser(
        createUserRequest.username,
        createUserRequest.netid,
        createUserRequest.givenName,
        createUserRequest.familyName,
        createUserRequest.photoUrl,
        createUserRequest.venmoHandle,
        createUserRequest.email,
        createUserRequest.googleId,
        createUserRequest.bio
      );
      // TODO: add fcm token to future fcm model / db
    });
  }

  public async getAllUsers(user: UserModel): Promise<UserModel[]> {
    if (!user.admin) throw new UnauthorizedError('User does not have permission to get all users')
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      return (await userRepository.getAllUsers()).filter((user) => user.isActive);
    });
  }

  public async getUserById(params: UuidParam): Promise<UserModel> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserById(params.id);
      if (!user) throw new NotFoundError('User not found!');
      if (!user.isActive) throw new NotFoundError('User is not active!');
      return user;
    });
  }

  public async getUserByGoogleId(id: string): Promise<UserModel> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserByGoogleId(id);
      if (!user) throw new NotFoundError('User not found!');
      if (!user.isActive) throw new NotFoundError('User is not active!');
      return user;
    });
  }

  public async getUserByPostId(params: UuidParam): Promise<UserModel> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const postRepository = Repositories.post(transactionalEntityManager);
      const user = await postRepository.getUserByPostId(params.id);
      if (!user) throw new NotFoundError('Post not found!');
      if (!user.isActive) throw new NotFoundError('User is not active!');
      return user;
    });
  }

  public async getUserByEmail(email: string): Promise<UserModel> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserByEmail(email);
      if (!user) throw new NotFoundError('User not found!');
      if (!user.isActive) throw new NotFoundError('User is not active!');
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

  public async blockUser(user: UserModel, blockUserRequest: BlockUserRequest): Promise<UserModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      if (user.id === blockUserRequest.blocked) {
        throw new UnauthorizedError('User cannot block themselves!');
      }
      if (!user.isActive) throw new UnauthorizedError('User is not active!');
      const joinedUser = await userRepository.getUserWithBlockedInfo(user.id);
      if (joinedUser?.blocking?.find((blockedUser) => blockedUser.id === blockUserRequest.blocked)) {
        throw new UnauthorizedError('User is already blocked!');
      }
      const blocked = await userRepository.getUserById(blockUserRequest.blocked);
      if (!blocked) throw new NotFoundError('Blocked user not found!');
      if (!joinedUser) throw new NotFoundError('Joined user not found!');
      return userRepository.blockUser(joinedUser, blocked);
    });
  }

  public async unblockUser(user: UserModel, unblockUserRequest: UnblockUserRequest): Promise<UserModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const blocked = await userRepository.getUserById(unblockUserRequest.unblocked);
      if (!blocked) throw new NotFoundError('Blocked user not found!');
      if (user.id === unblockUserRequest.unblocked) {
        throw new UnauthorizedError('User cannot unblock themselves!');
      }
      if (!user.isActive) throw new UnauthorizedError('User is not active!');
      const joinedUser = await userRepository.getUserWithBlockedInfo(user.id);
      if (!joinedUser) throw new NotFoundError('Joined user not found!');
      if (!joinedUser.blocking?.find((blockedUser) => blockedUser.id === unblockUserRequest.unblocked)) {
        throw new UnauthorizedError('User is not blocked!');
      }
      return userRepository.unblockUser(joinedUser, blocked);
    });
  }

  public async getBlockedUsersById(params: UuidParam): Promise<UserModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserWithBlockedInfo(params.id);
      if (!user) throw new NotFoundError('User not found!');
      // get user.blocking and filter out inactive users, else return empty array
      return user.blocking?.filter((blockedUser) => blockedUser.isActive) ?? [];
    });
  }

  public async deleteUser(user: UserModel, params: UuidParam): Promise<UserModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const userToDelete = await userRepository.getUserById(params.id);
      if (!userToDelete) throw new NotFoundError('User not found!');
      if (user.id !== userToDelete.id && !user.admin) {
        throw new UnauthorizedError('User does not have permission to delete other users');
      }
      return userRepository.deleteUser(userToDelete);
    });
  }

  public async softDeleteUser(params: UuidParam): Promise<UserModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const postRepository = Repositories.post(transactionalEntityManager);
      const requestRepository = Repositories.request(transactionalEntityManager);
      const user = await userRepository.getUserById(params.id);
      if (!user) throw new NotFoundError('User not found!');
      await postRepository.archiveAllPostsByUserId(user.id);
      await requestRepository.archiveAllRequestsByUserId(user.id);
      return userRepository.softDeleteUser(user);
    });
  }

  public async logout(fcmToken: FcmToken): Promise<null> {
      return null;
      // TODO: add fcm token to future fcm model / db and then delete it from model here 
  }
}