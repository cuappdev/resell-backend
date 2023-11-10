import { ConflictError } from '../errors';
import { UserModel } from '../models/UserModel';
import { Uuid } from '../types';
import { NotFoundError } from 'routing-controllers';
import { AbstractRepository, EntityRepository } from 'typeorm';
import { UserBlockingModel } from '../models/UserBlockingModel';

@EntityRepository(UserBlockingModel)
export class UserBlockingRepository extends AbstractRepository<UserBlockingModel> {
  public async getAllUserBlockings(): Promise<UserBlockingModel[]> {
    return await this.repository.find()
  }

  // public async getUserBlockingById(id: Uuid): Promise<UserBlocking | undefined> {
  //   return await this.createQueryBuilder('userBlocking')
  //     .where('userBlocking.id = "id', { id })
  //     .getOne();
  // }

  public async getAllUserBlockingsByBlockingUserId(userId: Uuid): Promise<UserBlockingModel[]> {
    return await this.createQueryBuilder('userBlockingTest')
      .leftJoinAndSelect('userBlocking.blockedUser', 'blockedUser')
      .where('userBlocking.blockingUser.id = :userId', { userId })
      .getMany();
  }

  public async getAllUserBlockingsByBlockedUserId(userId: Uuid): Promise<UserBlockingModel[]> {
    return await this.createQueryBuilder('userBlockingTest')
      .leftJoinAndSelect('userBlocking.blockingUser', 'blockingUser')
      .where('userBlocking.blockedUser.id = :userId', { userId })
      .getMany();
  }

  public async getUserBlockingByBothUsers(
    blockingUserId: string,
    blockedUserId: string
  ): Promise<UserBlockingModel | undefined> {
    return await this.createQueryBuilder('userBlockingTest')
      .where('userBlocking.blockingUser.id = :blockingUserId', { blockingUserId })
      .andWhere('userBlocking.blockedUser.id = :blockedUserId', { blockedUserId })
      .getOne();
  }

  public async blockUser(blockingUser: UserModel, blockedUser: UserModel): Promise<UserBlockingModel> {
    const userBlocking = new UserBlockingModel();
    userBlocking.blockingUser = blockingUser;
    userBlocking.blockedUser = blockedUser;
    return await this.repository.save(userBlocking);
  }

  public async unblockUser(userBlocking: UserBlockingModel): Promise<void> {
    await this.repository.remove(userBlocking);
  }
}
