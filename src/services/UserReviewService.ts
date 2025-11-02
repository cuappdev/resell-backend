import { ForbiddenError, NotFoundError } from 'routing-controllers';
import { Service } from 'typedi';
import { EntityManager, getManager } from 'typeorm';
// import { InjectManager } from 'typeorm-typedi-extensions';

import { CreateUserReviewRequest } from '../types';
import Repositories, { TransactionsManager } from '../repositories';
import { UuidParam } from '../api/validators/GenericRequests';
import { UserModel } from '../models/UserModel';
import { UserReviewModel } from '../models/UserReviewModel';

@Service()
export class UserReviewService {
    private transactions: TransactionsManager;

    constructor(entityManager?: EntityManager) {
    const manager = entityManager || getManager();
    
        this.transactions = new TransactionsManager(manager);
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
            const userRepository = Repositories.user(transactionalEntityManager);
            const buyer = await userRepository.getUserById(userReview.buyerId);
            if (!buyer) throw new NotFoundError('Buyer (reviewer) not found!');
            const seller = await userRepository.getUserById(userReview.sellerId);
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
            if (buyer.firebaseUid != userReview.buyer?.firebaseUid && !buyer.admin) throw new ForbiddenError("User is not buyer!");
            return userReviewRepository.deleteUserReview(userReview);
        })
    }
}