import { ForbiddenError, NotFoundError } from 'routing-controllers';
import { TransactionsManager } from 'src/repositories';
import { Service } from 'typedi';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';

import { UuidParam } from '../api/validators/GenericRequests';
import { UserReviewModel } from '../models/UserReviewModel';
import { UserModel } from '../models/UserModel';
import Repositories from '../repositories';
import { CreateUserReviewRequest } from 'src/types';

@Service()
export class UserReviewService {
    private transactions: TransactionsManager;

    constructor(@InjectManager() entityManager: EntityManager) {
        this.transactions = new TransactionsManager(entityManager);
    }

    public async getAllUserReviews(): Promise<UserReviewModel[]> {
        return this.transactions.readOnly(async (transactionalEntityManager) => {
          const userReviewRepository = Repositories.userReview(transactionalEntityManager);
          return await userReviewRepository.getAllUserReviews();
        });
      }

    public async getUserReviewById(params: UuidParam): Promise<UserReviewModel> {
        return this.transactions.readOnly(async (transactionalEntityManager) => {
            const userReviewRepository = Repositories.userReview(transactionalEntityManager);
            const userReview = await userReviewRepository.getUserReviewById(params.id);
            if (!userReview) throw new NotFoundError('Review not found!');
            return userReview;
        });
    }

    public async createUserReview(userReview: CreateUserReviewRequest): Promise<UserReviewModel> {
        return this.transactions.readWrite(async (transactionalEntityManager) => {
            const buyerRepository = Repositories.user(transactionalEntityManager);
            const buyer = await buyerRepository.getUserById(userReview.buyerId);
            if (!buyer) throw new NotFoundError('Buyer (reviewer) not found!');
            const sellerRespository = Repositories.user(transactionalEntityManager);
            const seller = await sellerRespository.getUserById(userReview.sellerId);
            if (!seller) throw new NotFoundError('Seller (reviewee) not found!');
            const userReviewRepository = Repositories.userReview(transactionalEntityManager);
            const freshUserReview = await userReviewRepository.createUserReview(userReview.fulfilled, userReview.stars, userReview.comments, buyer, seller);
            return freshUserReview;
        });
    }

    public async deleteUserReviewById(buyer: UserModel, params: UuidParam): Promise<UserReviewModel> {
        return this.transactions.readWrite(async (transactionalEntityManager) => {
            const userReviewRepository = Repositories.userReview(transactionalEntityManager);
            const userReview = await userReviewRepository.getUserReviewById(params.id);
            if (!userReview) throw new NotFoundError("User Review not found!");
            if (buyer.id != userReview.buyer?.id && !buyer.admin) throw new ForbiddenError("User is not buyer!");
            return userReviewRepository.deleteUserReview(userReview);
        })
    }
}