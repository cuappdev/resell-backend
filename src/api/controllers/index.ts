import { AuthController } from './AuthController';
import { BlockingController } from './BlockingController';
import { FeedbackController } from './FeedbackController';
import { ImageController } from './ImageController';
import { PostController } from './PostController';
import { RequestController } from './RequestController';
import { UserController } from './UserController';
import { UserReviewController } from './UserReviewController';
import { NotifController } from './NotifController'

export const controllers = [
  AuthController,
  BlockingController,
  FeedbackController,
  ImageController,
  NotifController,
  PostController,
  RequestController,
  UserController,
  UserReviewController,
];