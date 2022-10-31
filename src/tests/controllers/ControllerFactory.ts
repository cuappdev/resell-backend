import { Connection } from 'typeorm';

import { AuthController } from '../../api/controllers/AuthController';
import { PostController } from '../../api/controllers/PostController';
import { RequestController } from '../../api/controllers/RequestController';
import { UserController } from '../../api/controllers/UserController';
import { AuthService } from '../../services/AuthService';
import { PostService } from '../../services/PostService';
import { RequestService } from '../../services/RequestService';
import { UserService } from '../../services/UserService';

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
}