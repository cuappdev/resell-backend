import { NotFoundError } from 'routing-controllers';
import { UuidParam } from 'src/api/validators/GenericRequests';
import { Service } from 'typedi';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';

import { FeedbackModel } from '../models/FeedbackModel';
import Repositories, { TransactionsManager } from '../repositories';
import { CreateFeedbackRequest, GetSearchedFeedbackRequest } from '../types';

@Service()
export class FeedbackService {
  private transactions: TransactionsManager;

  constructor(@InjectManager() entityManager: EntityManager) {
    this.transactions = new TransactionsManager(entityManager);
  }

  public async getAllFeedback(): Promise<FeedbackModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const feedbackRepository = Repositories.feedback(transactionalEntityManager);
      return await feedbackRepository.getAllFeedback();
    });
  }

  public async getFeedbackById(params: UuidParam): Promise<FeedbackModel> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const feedbackRepository = Repositories.feedback(transactionalEntityManager);
      const feedback = await feedbackRepository.getFeedbackById(params.id);
      if (!feedback) throw new NotFoundError('Feedback not found!');
      return feedback;
    });
  }

  public async getFeedbackByUserId(params: UuidParam): Promise<FeedbackModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
    const feedbackRepository = Repositories.feedback(transactionalEntityManager);
    const feedback = await feedbackRepository.getFeedbackByUserId(params.id);
    if (!feedback) throw new NotFoundError('User not found!');
    return feedback;
    });
  }

  public async createFeedback(feedback: CreateFeedbackRequest): Promise<FeedbackModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserById(feedback.userId);
      if (!user) throw new NotFoundError('User not found!');
      const feedbackRepository = Repositories.feedback(transactionalEntityManager);
      return await feedbackRepository.createFeedback(feedback.description, feedback.images, user);
    });
  }

  public async deleteFeedbackById(params: UuidParam): Promise<FeedbackModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const feedbackRepository = Repositories.feedback(transactionalEntityManager);
      const feedback = await feedbackRepository.getFeedbackById(params.id);
      if (!feedback) throw new NotFoundError('Feedback not found!');
      return await feedbackRepository.deleteFeedback(feedback);
    });
  }

  public async searchFeedback(GetSearchedFeedbackRequest:GetSearchedFeedbackRequest): Promise<FeedbackModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const feedbackRepository = Repositories.feedback(transactionalEntityManager);
      return await feedbackRepository.searchFeedback(GetSearchedFeedbackRequest.keywords.toLowerCase());
    });
  }

}