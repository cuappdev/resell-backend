import { UserModel } from 'src/models/UserModel';
import { AbstractRepository, EntityRepository } from 'typeorm';

import { RequestModel } from '../models/RequestModel';
import { Uuid } from '../types';

@EntityRepository(RequestModel)
export class RequestRepository extends AbstractRepository<RequestModel> {
  public async getAllRequest(): Promise<RequestModel[]> {
    return await this.repository.createQueryBuilder("request")
      .leftJoinAndSelect("request.user", "user")
      .getMany();
  }

  public async getRequestById(id: Uuid): Promise<RequestModel | undefined> {
    return await this.repository
      .createQueryBuilder("request")
      .where("request.id = :id", { id })
      .getOne();
  }

  public async getRequestByUserId(userId: Uuid): Promise<RequestModel[]> {
    return await this.repository
      .createQueryBuilder("request")
      .leftJoinAndSelect("request.user", "user")
      .where("user.id = :userId", { userId })
      .getMany();
  }

  public async createRequest(
    title: string,
    description: string,
    user: UserModel
  ): Promise<RequestModel> {
    const request = this.repository.create({
      title,
      description,
      user,
    });
    await this.repository.save(request);
    return request;
  }

  public async deleteRequest(request: RequestModel): Promise<RequestModel> {
    return this.repository.remove(request);
  }
}