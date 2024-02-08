import { Connection } from 'typeorm';

import { AuthController } from '../../api/controllers/AuthController';
import { BlockingController } from '../../api/controllers/BlockingController';
import { PostController } from '../../api/controllers/PostController';
import { RequestController } from '../../api/controllers/RequestController';
import { UserController } from '../../api/controllers/UserController';
import { UserReviewController } from '../../api/controllers/UserReviewController';
import { AuthService } from '../../services/AuthService';
import { BlockingService } from '../../services/BlockingService';
import { PostService } from '../../services/PostService';
import { RequestService } from '../../services/RequestService';
import { UserService } from '../../services/UserService';
import { UserReviewService } from '../../services/UserReviewService';

export class ControllerFactory {
    public static user(conn: Connection): UserController {
      const userService = new UserService(conn.manager);
      return new UserController(userService);
    }

    public static post(conn: Connection): PostController {
      const postService = new PostService(conn.manager);
      return new PostController(postService);
    }

    public static auth(conn: Connection): AuthController {
      const authService = new AuthService(conn.manager);
      return new AuthController(authService);
    }

    public static request(conn: Connection): RequestController {
      const requestService = new RequestService(conn.manager);
      return new RequestController(requestService);
    }

    public static userReview(conn: Connection): UserReviewController {
      const userReviewService = new UserReviewService(conn.manager);
      return new UserReviewController(userReviewService);
    }

    public static blocking(conn: Connection): BlockingController {
      const blockingService = new BlockingService(conn.manager);
      return new BlockingController(blockingService);
    }
}