import { UserModel } from 'src/models/UserModel';
import { AbstractRepository, EntityRepository } from 'typeorm';

import { FeedbackModel } from '../models/FeedbackModel';
import { Uuid } from '../types';

@EntityRepository(FeedbackModel)
export class FeedbackRepository extends AbstractRepository<FeedbackModel> {
  public async getAllFeedback(): Promise<FeedbackModel[]> {
    return await this.repository.createQueryBuilder("feedback")
    .getMany();
  }

  public async getFeedbackById(id: Uuid): Promise<FeedbackModel | undefined> {
    const feedback = await this.repository
    .createQueryBuilder("feedback")
    .where("feedback.id=:id", { id })
    .getOne();
  return feedback;
  }

  public async createFeedback (
    description: string,
    images: string[],
    user: UserModel
  ): Promise<FeedbackModel> {
    const feedback = this.repository.create({
      description,
      images,
      user,
    });
    await this.repository.save(feedback);
    return feedback;
  }

  public async getFeedbackByUserId(userId: Uuid): Promise<FeedbackModel[]> {
    return await this.repository
      .createQueryBuilder("feedback")
      .leftJoinAndSelect("feedback.user", "user")
      .where("user.id = :userId", { userId })
      .getMany();
  }

  public async deleteFeedback(feedback: FeedbackModel): Promise<FeedbackModel> {
    return this.repository.remove(feedback);
  }

  public async searchFeedback(keywords: String): Promise<FeedbackModel[]> {
    const feedback = await this.repository
      .createQueryBuilder("feedback")
      .where("feedback.description like :keywords", {keywords: `%${keywords}%`})
      .getMany();
    return feedback;
  }
}