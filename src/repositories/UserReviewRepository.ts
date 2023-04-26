import { AbstractRepository, EntityRepository } from 'typeorm';

import { UserReviewModel } from '../models/UserReviewModel';
import { UserModel } from '../models/UserModel';
import { Uuid } from '../types';

@EntityRepository(UserReviewModel)
export class UserReviewRepository extends AbstractRepository<UserReviewModel> {
    public async getAllUserReviews(): Promise<UserReviewModel[]> {
        return await this.repository
            .createQueryBuilder("review")
            .leftJoinAndSelect("review.buyer", "user")
            .getMany();
    }

    public async getUserReviewById(id: Uuid): Promise<UserReviewModel | undefined> {
        return await this.repository
          .createQueryBuilder("review")
          .leftJoinAndSelect("review.buyer", "user")
          .where("review.id = :id", { id })
          .getOne();
      }
    
      public async createUserReview(
        fulfilled: boolean,
        stars: number,
        comments: string,
        buyer: UserModel,
        seller: UserModel
      ): Promise<UserReviewModel> {
        const review = new UserReviewModel();
        review.fulfilled = fulfilled;
        review.stars = stars;
        review.comments = comments;
        review.buyer = buyer;
        review.seller = seller;
        return await this.repository.save(review);
      }

      public async deleteUserReview(review: UserReviewModel): Promise<UserReviewModel> {
        return await this.repository.remove(review);
      }
}