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

  public async getRequestByUserId(userId: string): Promise<RequestModel[]> {
    return await this.repository
      .createQueryBuilder("request")
      .leftJoinAndSelect("request.user", "user")
      .where("user.firebaseUid = :userId", { userId })
      .getMany();
  }

  public async createRequest(
    title: string,
    description: string,
    archive: boolean,
    user: UserModel,
    embedding: number[]
  ): Promise<RequestModel> {
    const request = this.repository.create({
      title,
      description,
      archive,
      user,
      embedding,
    });
    await this.repository.save(request);
    return request;
  }

  public async deleteRequest(request: RequestModel): Promise<RequestModel> {
    return this.repository.remove(request);
  }

  public async archiveRequest(request: RequestModel): Promise<RequestModel> {
    request.archive = true;
    return await this.repository.save(request);
  }

  public async archiveAllRequestsByUserId(userId: Uuid): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(RequestModel)
      .set({ archive: true })
      .where("user.firebaseUid = :userId", { userId })
      .execute();
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
    // check if they don't have the same user
    if (request.user.firebaseUid === post.user.firebaseUid) {
      // User is the same, don't match
      // Throw error maybe?
      return request;
    }
    
    if (request.matches === undefined) { request.matches = [post]; }
    else { request.matches.push(post); }
    return this.repository.save(request);
  }

  public async findSimilarRequests(embedding: number[], excludeUserId: string, limit: number = 10): Promise<RequestModel[]> {
    const lit = `[${embedding.join(",")}]`;
    return await this.repository
      .createQueryBuilder("request")
      .where("request.embedding IS NOT NULL")
      .andWhere("request.user != :excludeUserId", { excludeUserId })
      .orderBy(`request.embedding::vector <-> CAST('${lit}' AS vector(512))`)
      .setParameter("embedding", embedding)
      .limit(limit)
      .getMany();
  }
  
}