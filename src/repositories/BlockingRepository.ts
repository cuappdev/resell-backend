import { ConflictError } from '../errors';
import { UserModel } from '../models/UserModel';
import { Uuid } from '../types';
import { NotFoundError } from 'routing-controllers';
import { AbstractRepository, EntityRepository } from 'typeorm';
import { BlockingModel } from '../models/BlockingModel';

@EntityRepository(BlockingModel)
export class BlockingRepository extends AbstractRepository<BlockingModel> {
  public async getAllBlockings(): Promise<BlockingModel[]> {
    return this.repository.find();
  }

  public async getBlockingByBlockerId(blockerId: Uuid): Promise<BlockingModel[]> {
    return await this.createQueryBuilder('blocking')
      .leftJoinAndSelect('blocking.blocker', 'blocker')
      .where('blocker.id = :blockerId', { blockerId })
      .getMany();
  }

  public async getBlockingByBothIds(blockerId: Uuid, blockedId: Uuid): Promise<BlockingModel | undefined> {
    return await this.createQueryBuilder('blocking')
    .where('blocking.blockerId = :blockerId', { blockerId})
    .andWhere('blocking.blockedId = :blockedId', { blockedId })
    .getOne();
  }

  public async blockUser(blocker: UserModel, blocked: UserModel): Promise<BlockingModel> {
    const blocking = new BlockingModel();
    blocking.blocker = blocker;
    blocking.blocked = blocked;
    return this.repository.save(blocking);
  }

  public async unblockUser(blocking: BlockingModel): Promise<void> {
    await this.repository.remove(blocking);
  }
}
