import { AuthController } from './AuthController';
import { FeedbackController } from './FeedbackController';
import { ImageController } from './ImageController';
import { PostController } from './PostController';
import { RequestController } from './RequestController';
import { UserController } from './UserController';
import { UserReviewController } from './UserReviewController';
import { NotifController } from './NotifController'
import { ReportController } from './ReportController';
import { TransactionController } from './TransactionController';
import { TransactionReviewController } from './TransactionReviewController';
import { ChatController } from './ChatController';
import { AuthTokenController } from './AuthToken';

export const controllers = [
  AuthController,
  AuthTokenController,
  ChatController,
  FeedbackController,
  ImageController,
  NotifController,
  PostController,
  RequestController,
  ReportController,
  UserController,
  UserReviewController,
  TransactionController,
  TransactionReviewController
];