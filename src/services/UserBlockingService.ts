import { EntityManager, TransactionAlreadyStartedError, getManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';
import { UserModel } from '../models/UserModel';
import { UserBlocking } from '../models/UserBlockingModel';
import { Service } from 'typedi'
import Repositories, { TransactionsManager } from '../repositories';
import { Uuid } from 'src/types';
import { ForbiddenError, UnauthorizedError } from 'routing-controllers';
import { UuidParam, UuidParams } from '../api/validators/GenericRequests';
import { NotFoundError } from 'routing-controllers';
import { ConflictError } from '../errors';

@Service()
export class UserBlockingService {
  private transactions: TransactionsManager;

  constructor(@InjectManager() entityManager: EntityManager) {
    this.transactions = new TransactionsManager(entityManager);
  }

  public async getAllUserBlockings(user: UserModel): Promise<UserBlocking[]> {
    // if (!user.admin) throw new UnauthorizedError('User does not have permission to get all user blockings!')
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userBlockingRepository = Repositories.userBlocking(transactionalEntityManager);
      return userBlockingRepository.getAllUserBlockings();
    });
  }

  public async getUserBlockingById(params: UuidParam): Promise<UserBlocking> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userBlockingRepository = Repositories.userBlocking(transactionalEntityManager);
      const userBlocking = await userBlockingRepository.getUserBlockingById(params.id);
      if (!userBlocking) throw new NotFoundError('Blocking not found!')
      return userBlocking;
    })
  }

  public async getAllUserBlockingsByBlockingUserId(user: UserModel, params: UuidParam): Promise<UserBlocking[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      if ((!user.admin) || (user.id != params.id)) throw new UnauthorizedError('User does not have permission to get all user blockings by this id!')
      const userRepository = Repositories.user(transactionalEntityManager);
      const blockingUser = await userRepository.getUserById(params.id);
      if (!blockingUser) throw new NotFoundError('User not found!');
      const userBlockingRepository = Repositories.userBlocking(transactionalEntityManager);
      return userBlockingRepository.getAllUserBlockingsByBlockingUserId(params.id);
    });
  }

  public async getAllUserBlockingsByBlockedUserId(user: UserModel, params: UuidParam): Promise<UserBlocking[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      if (!user.admin) throw new UnauthorizedError('User does not have permission to get all user blockings by this id!')
      const userRepository = Repositories.user(transactionalEntityManager);
      const blockedUser = await userRepository.getUserById(params.id);
      if (!blockedUser) throw new NotFoundError('User not found!');
      const userBlockingRepository = Repositories.userBlocking(transactionalEntityManager);
      return userBlockingRepository.getAllUserBlockingsByBlockedUserId(params.id);
    });
  }

  public async getUserBlockingByBothIds(params: UuidParams): Promise<UserBlocking | undefined> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const blockingUser = await userRepository.getUserById(params.id1);
      if (!blockingUser) throw new NotFoundError('User not found!');
      const blockedUser = await userRepository.getUserById(params.id2);
      if (!blockedUser) throw new NotFoundError('User not found!');
      const userBlockingRepository = Repositories.userBlocking(transactionalEntityManager);
      return userBlockingRepository.getUserBlockingByBothUsers(params.id1, params.id2);
    })
  }

  public async blockUser(blockingUserId: Uuid, blockedUserId: Uuid): Promise<UserBlocking> {
    // if (user.id != post.user?.id && !user.admin) throw new ForbiddenError('User is not poster!');
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const blockingUser = await userRepository.getUserById(blockingUserId);
      const blockedUser = await userRepository.getUserById(blockedUserId);
      if (!blockingUser || !blockedUser) throw new NotFoundError('User not found');
      const userBlockingRepository = Repositories.userBlocking(transactionalEntityManager);
      const existingBlocking = await userBlockingRepository.getUserBlockingByBothUsers(blockingUserId, blockedUserId);
      if (existingBlocking) throw new ConflictError('Blocking relationship already exists');
      return await userBlockingRepository.blockUser(blockingUser, blockedUser);
    });
  }

  public async unblockUser(user: UserModel, blockingUserId: Uuid, blockedUserId: Uuid): Promise<void> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      if (user.id != blockingUserId && !user.admin) throw new ForbiddenError('User is not blocker!')
      const userBlockingRepository = Repositories.userBlocking(transactionalEntityManager);
      const existingBlocking = await userBlockingRepository.getUserBlockingByBothUsers(blockingUserId, blockedUserId);
      if (!existingBlocking) throw new NotFoundError('User blocking relationship not found');
      return await userBlockingRepository.unblockUser(existingBlocking)
    });
  }
}
