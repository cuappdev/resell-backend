import { Connection } from 'typeorm';
import { UserController } from '../../api/controllers/UserController'
import { UserService } from '../../services/UserService'

export class ControllerFactory {
    public static user(conn: Connection): UserController {
      const userService = new UserService(conn.manager);
      return new UserController(userService);
    }
}