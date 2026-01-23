import { NotFoundError, UnauthorizedError } from 'routing-controllers';
import { Service } from 'typedi';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';
import { getFirestore } from 'firebase-admin/firestore';

import { UuidParam, FirebaseUidParam } from '../api/validators/GenericRequests';
import { UserModel } from '../models/UserModel';
import Repositories, { TransactionsManager } from '../repositories';
import { EditProfileRequest, SaveTokenRequest, SetAdminByEmailRequest, BlockUserRequest, UnblockUserRequest, CreateUserRequest, FcmTokenRequest, FollowUserRequest, UnfollowUserRequest } from '../types';
import { uploadImage } from '../utils/Requests';

const db = getFirestore();
const availabilityRef = db.collection('availability');

@Service()
export class UserService {
  private transactions: TransactionsManager;

  constructor(@InjectManager() entityManager: EntityManager) {
    this.transactions = new TransactionsManager(entityManager);
  }

  public async createUser(user: UserModel, createUserRequest: CreateUserRequest): Promise<UserModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const makeUser = await userRepository.createUser(
        user.firebaseUid,
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

      // Create empty availability in Firestore for new user
      const now = new Date();
      const availabilityDoc = await availabilityRef.add({
        userId: user.firebaseUid,
        schedule: {},  // Empty day-keyed object
        updatedAt: now
      });

      // Link availability to user
      await userRepository.updateAvailabilityId(user.firebaseUid, availabilityDoc.id);
      makeUser.availabilityId = availabilityDoc.id;

      const fcmRepository = Repositories.fcmToken(transactionalEntityManager);
      const token = await fcmRepository.createFcmToken(
        createUserRequest.fcmToken,
        true,
        new Date(),
        makeUser
      );
      makeUser.tokens = [token];
      return makeUser;
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
      if (user.firebaseUid === blockUserRequest.blocked) {
        throw new UnauthorizedError('User cannot block themselves!');
      }
      if (!user.isActive) throw new UnauthorizedError('User is not active!');
      const joinedUser = await userRepository.getUserWithBlockedInfo(user.firebaseUid);
      if (joinedUser?.blocking?.find((blockedUser) => blockedUser.firebaseUid === blockUserRequest.blocked)) {
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
      if (user.firebaseUid === unblockUserRequest.unblocked) {
        throw new UnauthorizedError('User cannot unblock themselves!');
      }
      if (!user.isActive) throw new UnauthorizedError('User is not active!');
      const joinedUser = await userRepository.getUserWithBlockedInfo(user.firebaseUid);
      if (!joinedUser) throw new NotFoundError('Joined user not found!');
      if (!joinedUser.blocking?.find((blockedUser) => blockedUser.firebaseUid === unblockUserRequest.unblocked)) {
        throw new UnauthorizedError('User is not blocked!');
      }
      return userRepository.unblockUser(joinedUser, blocked);
    });
  }

  public async followUser(user: UserModel, followUserRequest: FollowUserRequest): Promise<UserModel> {
    console.log(`[UserService] followUser called by ${user.firebaseUid} to follow ${followUserRequest.userId}`);
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      if (user.firebaseUid === followUserRequest.userId) {
        throw new UnauthorizedError('User cannot follow themselves!');
      }
      if (!user.isActive) throw new UnauthorizedError('User is not active!');
      const joinedUser = await userRepository.getUserWithBlockedInfo(user.firebaseUid);

      if (!joinedUser) {
        console.error(`[UserService] Current user ${user.firebaseUid} not found in DB`);
        throw new NotFoundError('Joined user not found!');
      }

      if (joinedUser?.following?.find((followingUser) => followingUser.firebaseUid === followUserRequest.userId)) {
        throw new UnauthorizedError('User is already following!');
      }
      const following = await userRepository.getUserById(followUserRequest.userId);
      if (!following) {
        console.error(`[UserService] Target user ${followUserRequest.userId} not found in DB`);
        throw new NotFoundError('User to follow not found!');
      }

      return userRepository.followUser(joinedUser, following);
    });
  }

  public async unfollowUser(user: UserModel, unfollowUserRequest: UnfollowUserRequest): Promise<UserModel> {
    console.log(`[UserService] unfollowUser called by ${user.firebaseUid} to unfollow ${unfollowUserRequest.userId}`);
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const following = await userRepository.getUserById(unfollowUserRequest.userId);
      if (!following) {
        console.error(`[UserService] Target user ${unfollowUserRequest.userId} not found in DB`);
        throw new NotFoundError('User to unfollow not found!');
      }
      if (user.firebaseUid === unfollowUserRequest.userId) {
        throw new UnauthorizedError('User cannot unfollow themselves!');
      }
      if (!user.isActive) throw new UnauthorizedError('User is not active!');
      const joinedUser = await userRepository.getUserWithBlockedInfo(user.firebaseUid);
      if (!joinedUser) {
        console.error(`[UserService] Current user ${user.firebaseUid} not found in DB`);
        throw new NotFoundError('Joined user not found!');
      }
      return userRepository.unfollowUser(joinedUser, following);
    });
  }

  public async getFollowers(params: UuidParam): Promise<UserModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserById(params.id);
      if (!user) throw new NotFoundError('User not found!');
      return userRepository.getFollowers(user);
    });
  }

  public async getFollowing(params: UuidParam): Promise<UserModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserById(params.id);
      if (!user) throw new NotFoundError('User not found!');
      return userRepository.getFollowing(user);
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

  public async deleteUser(user: UserModel): Promise<UserModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const userToDelete = await userRepository.getUserById(user.firebaseUid);
      if (!userToDelete) throw new NotFoundError('User not found!');
      const fcmRepository = Repositories.fcmToken(transactionalEntityManager);
      await fcmRepository.deleteAllTokensByUserId(userToDelete.firebaseUid);
      return userRepository.deleteUser(userToDelete);
    });
  }

  public async deleteUserByOtherUser(user: UserModel, params: FirebaseUidParam): Promise<UserModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const userToDelete = await userRepository.getUserById(params.id);
      if (!userToDelete) throw new NotFoundError('User not found!');
      if (user.firebaseUid !== userToDelete.firebaseUid && !user.admin) {
        throw new UnauthorizedError('User does not have permission to delete other users');
      }
      return userRepository.deleteUser(userToDelete);
    });
  }

  public async softDeleteUser(params: FirebaseUidParam): Promise<UserModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const postRepository = Repositories.post(transactionalEntityManager);
      const requestRepository = Repositories.request(transactionalEntityManager);
      const user = await userRepository.getUserById(params.id);
      if (!user) throw new NotFoundError('User not found!');
      await postRepository.archiveAllPostsByUserId(user.firebaseUid);
      await requestRepository.archiveAllRequestsByUserId(user.firebaseUid);
      return userRepository.softDeleteUser(user);
    });
  }

  public async logout(fcmTokenRequest: FcmTokenRequest): Promise<null> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const fcmRepository = Repositories.fcmToken(transactionalEntityManager);
      const token = await fcmRepository.getTokenByFcmToken(fcmTokenRequest.token);
      if (!token) throw new NotFoundError('Token not found!');
      await fcmRepository.deleteToken(token);
      return null;
    });
  }
}