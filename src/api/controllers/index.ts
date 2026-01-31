import { AuthController } from './AuthController';
import { AvailabilityController } from './AvailabilityController';
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
import { SearchController } from './SearchController';

export const controllers = [
  AuthController,
  AuthTokenController,
  AvailabilityController,
  ChatController,
  FeedbackController,
  ImageController,
  NotifController,
  PostController,
  RequestController,
  ReportController,
  SearchController,
  UserController,
  UserReviewController,
  TransactionController,
  TransactionReviewController,
];
