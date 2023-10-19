import { ConflictError } from '../errors';
import { UserModel } from '../models/UserModel';
import { Uuid } from '../types';
import { NotFoundError } from 'routing-controllers';
import { AbstractRepository, EntityRepository } from 'typeorm';
import { UserBlocking } from '../models/UserBlockingModel';

@EntityRepository(UserBlocking)
export class UserBlockingRepository extends AbstractRepository<UserBlocking> {
  public async getAllUserBlockings(): Promise<UserBlocking[]> {
    return await this.repository.find()
  }

  public async getUserBlockingById(id: Uuid): Promise<UserBlocking | undefined> {
    return await this.createQueryBuilder('userBlocking')
      .where('userBlocking.id = "id', { id })
      .getOne();
  }

  public async getAllUserBlockingsByBlockingUserId(userId: Uuid): Promise<UserBlocking[]> {
    return await this.createQueryBuilder('userBlocking')
      .leftJoinAndSelect('userBlocking.blockedUser', 'blockedUser')
      .where('userBlocking.blockingUser.id = :userId', { userId })
      .getMany();
  }

  public async getAllUserBlockingsByBlockedUserId(userId: Uuid): Promise<UserBlocking[]> {
    return await this.createQueryBuilder('userBlocking')
      .leftJoinAndSelect('userBlocking.blockingUser', 'blockingUser')
      .where('userBlocking.blockedUser.id = :userId', { userId })
      .getMany();
  }

  public async getUserBlockingByBothUsers(
    blockingUserId: string,
    blockedUserId: string
  ): Promise<UserBlocking | undefined> {
    return await this.createQueryBuilder('userBlocking')
      .where('userBlocking.blockingUser.id = :blockingUserId', { blockingUserId })
      .andWhere('userBlocking.blockedUser.id = :blockedUserId', { blockedUserId })
      .getOne();
  }

  public async blockUser(blockingUser: UserModel, blockedUser: UserModel): Promise<UserBlocking> {
    const userBlocking = new UserBlocking();
    userBlocking.blockingUser = blockingUser;
    userBlocking.blockedUser = blockedUser;
    return await this.repository.save(userBlocking);
  }

  public async unblockUser(userBlocking: UserBlocking): Promise<void> {
    await this.repository.remove(userBlocking);
  }
}
