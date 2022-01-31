import {
  JsonController, Params, Get, Post, Patch, UseBefore, Body, BodyParam,
} from 'routing-controllers';
import User from '../models/UserModel'
import {
  GetCurrentUserResponse,
} from '../types';

// import { UserAuthentication } from '../middleware/UserAuthentication';
// import { AuthenticatedUser } from '../decorators/AuthenticatedUser';

// @UseBefore(UserAuthentication)
@JsonController('user/')
export class UserController {

  constructor() {
    return;
  }

  @Get()
  async helloWorldName(@BodyParam("name") name: string): Promise<string> {
    return "Hello world, ".concat(name, "!");
  }
}