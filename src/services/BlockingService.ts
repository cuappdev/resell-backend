import { EntityManager, TransactionAlreadyStartedError, getManager } from "typeorm";
import { InjectManager } from "typeorm-typedi-extensions";
import { UserModel } from "../models/UserModel";
import { BlockingModel } from "../models/BlockingModel";
import { Service } from "typedi";
import Repositories, { TransactionsManager } from "../repositories";
import { Uuid } from "src/types";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "routing-controllers";
import { UuidParam, UuidParams } from '../api/validators/GenericRequests'
import { ConflictError } from "../errors";

@Service()
export class BlockingService {
  private transactions: TransactionsManager;

  constructor(@InjectManager() entityManager: EntityManager) {
    this.transactions = new TransactionsManager(entityManager);
  }

  public async getAllBlockings(user: UserModel): Promise<BlockingModel[]> {
    if (!user.admin) {
      throw new UnauthorizedError('User does not have permission to view all blockings');
    }
    return await this.transactions.readOnly(async (transactionalEntityManager) => {
      const blockingRepository = Repositories.blocking(transactionalEntityManager);
      return blockingRepository.getAllBlockings();
    });
  }

  public async getBlockingByBlockerId(user: UserModel, params: UuidParam): Promise<BlockingModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      if ((!user.admin) || (user.id != params.id)) throw new UnauthorizedError('User does not have persmission to get all user blockings by this id!')
      const userRepository = Repositories.user(transactionalEntityManager);
      const blocker = await userRepository.getUserById(params.id);
      if (!blocker) throw new NotFoundError('User not found!');
      const blockingRepository = Repositories.blocking(transactionalEntityManager);
      return blockingRepository.getBlockingByBlockerId(params.id);
    })
  }

  public async getBlockingByBothIds(params: UuidParams): Promise<BlockingModel | undefined> {
    return this.transactions.readOnly(async (transactionEntityManager) => {
      const userRepository = Repositories.user(transactionEntityManager);
      const blocker = await userRepository.getUserById(params.id1);
      const blocked = await userRepository.getUserById(params.id2);
      if (!blocker || !blocked) throw new NotFoundError('User not found!');
      const blockingRepository = Repositories.blocking(transactionEntityManager);
      return blockingRepository.getBlockingByBothIds(params.id1, params.id2);
    })
  }

  public async blockUser(user: UserModel, params: UuidParams): Promise<BlockingModel> {
    if (user.id != params.id1) throw new UnauthorizedError('User does not have permission to block this user!');
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const blocker = await userRepository.getUserById(params.id1);
      const blocked = await userRepository.getUserById(params.id2);
      if (!blocker || !blocked) throw new NotFoundError('User not found!');
      const blockingRepository = Repositories.blocking(transactionalEntityManager);
      const blocking = await blockingRepository.getBlockingByBothIds(params.id1, params.id2);
      if (blocking) throw new ConflictError('Blocking already exists!');
      return blockingRepository.blockUser(blocker, blocked);
    })
  }

  public async unblockUser(user: UserModel, params: UuidParams): Promise<void> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      if (user.id != params.id1 && !user.admin) throw new UnauthorizedError('User does not have permission to unblock this user!');
      const userRepository = Repositories.user(transactionalEntityManager);
      const blocker = await userRepository.getUserById(params.id1);
      const blocked = await userRepository.getUserById(params.id2);
      if (!blocker || !blocked) throw new NotFoundError('User not found!');
      const blockingRepository = Repositories.blocking(transactionalEntityManager);
      const blocking = await blockingRepository.getBlockingByBothIds(params.id1, params.id2);
      if (!blocking) throw new NotFoundError('Blocking not found!');
      return blockingRepository.unblockUser(blocking);
    })
  }
}