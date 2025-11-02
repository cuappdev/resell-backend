import { Connection } from 'typeorm';

import { AuthController } from '../../api/controllers/AuthController';
import { PostController } from '../../api/controllers/PostController';
import { RequestController } from '../../api/controllers/RequestController';
import { UserController } from '../../api/controllers/UserController';
import { UserReviewController } from '../../api/controllers/UserReviewController';
import { TransactionController } from '../../api/controllers/TransactionController';
import { TransactionReviewController } from '../../api/controllers/TransactionReviewController';
import { NotifController } from '../../api/controllers/NotifController';


export class ControllerFactory {
    public static user(conn: Connection): UserController {
      return new UserController();
    }

    public static post(conn: Connection): PostController {
      return new PostController();
    }

    public static auth(conn: Connection): AuthController {
      return new AuthController();
    }

    public static request(conn: Connection): RequestController {
      return new RequestController();
    }

    public static userReview(conn: Connection): UserReviewController {
      return new UserReviewController();
    }

    public static transaction(conn: Connection): TransactionController {
      return new TransactionController();
    }

    public static transactionReview(conn: Connection): TransactionReviewController {
      return new TransactionReviewController();
    }

    public static notif(conn: Connection): NotifController {
      return new NotifController();
    }
}