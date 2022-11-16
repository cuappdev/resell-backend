import { PostModel } from 'src/models/PostModel';
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

  public async getAllMatchesByRequestId(id: Uuid): Promise<RequestModel | undefined> {
    return await this.repository
      .createQueryBuilder("request")
      .where("request.id = :id", { id })
      .leftJoinAndSelect("request.matches", "posts")
      .getOne();
  }

  public async getTimedMatchesByRequestId(id: Uuid, time: Date): Promise<RequestModel | undefined> {
    return await this.repository
      .createQueryBuilder("request")
      .where("request.id = :id", { id })
      .leftJoinAndSelect("request.matches", "posts")
      .where("posts.created >= :time", { time })
      .getOne();
  }

  public async addMatchToRequest(request: RequestModel, post: PostModel): Promise<RequestModel> {
    if (request.matches) request.matches.push(post);
    else request.matches = [post];
    return this.repository.save(request);
  }
}