import {
  Body,
  CurrentUser,
  Get,
  JsonController,
  Param,
  Params,
  Post,
  Delete,
} from "routing-controllers";

import { UserModel } from "../../models/UserModel";
import { UserService } from "../../services/UserService";
import {
  BlockUserRequest,
  UnblockUserRequest,
  EditProfileRequest,
  GetUserByEmailRequest,
  GetUserResponse,
  GetUsersResponse,
  CreateUserRequest,
  SetAdminByEmailRequest,
  FcmTokenRequest,
} from "../../types";
import { UuidParam, FirebaseUidParam } from "../validators/GenericRequests";

@JsonController("user/")
export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  @Post("create/")
  async createUser(
    @CurrentUser() user: UserModel,
    @Body() createUserRequest: CreateUserRequest,
  ): Promise<UserModel> {
    return await this.userService.createUser(user, createUserRequest);
  }

  @Get()
  async getUsers(@CurrentUser() user: UserModel): Promise<GetUsersResponse> {
    const users = await this.userService.getAllUsers(user);
    return { users: users.map((user) => user.getUserProfile()) };
  }

  @Post()
  async editProfile(
    @Body({ options: { limit: process.env.UPLOAD_SIZE_LIMIT } })
    editProfileRequest: EditProfileRequest,
    @CurrentUser() user: UserModel,
  ): Promise<GetUserResponse> {
    return {
      user: await this.userService.updateUser(editProfileRequest, user),
    };
  }

  @Get("id/:id/")
  async getUserById(
    @Params() params: FirebaseUidParam,
  ): Promise<GetUserResponse> {
    return { user: await this.userService.getUserById(params) };
  }

  @Get("googleId/:id/")
  async getUserByGoogleId(@Param("id") id: string): Promise<GetUserResponse> {
    return { user: await this.userService.getUserByGoogleId(id) };
  }

  @Get("postId/:id/")
  async getUserByPostId(@Params() params: UuidParam): Promise<GetUserResponse> {
    return { user: await this.userService.getUserByPostId(params) };
  }

  @Post("email/")
  async getUserByEmail(
    @Body() getUserByEmailRequest: GetUserByEmailRequest,
  ): Promise<GetUserResponse> {
    return {
      user: await this.userService.getUserByEmail(getUserByEmailRequest.email),
    };
  }

  @Post("admin/")
  async setAdmin(
    @Body() setAdminByEmailRequest: SetAdminByEmailRequest,
    @CurrentUser() superAdmin: UserModel,
  ): Promise<GetUserResponse> {
    return {
      user: await this.userService.setAdmin(superAdmin, setAdminByEmailRequest),
    };
  }

  @Post("block/")
  async blockUser(
    @Body() blockUserRequest: BlockUserRequest,
    @CurrentUser() user: UserModel,
  ): Promise<GetUserResponse> {
    return { user: await this.userService.blockUser(user, blockUserRequest) };
  }

  @Post("unblock/")
  async unblockUser(
    @Body() unblockUserRequest: UnblockUserRequest,
    @CurrentUser() user: UserModel,
  ): Promise<GetUserResponse> {
    return {
      user: await this.userService.unblockUser(user, unblockUserRequest),
    };
  }

  @Get("blocked/id/:id/")
  async getBlockedUsersById(
    @Params() params: UuidParam,
  ): Promise<GetUsersResponse> {
    return { users: await this.userService.getBlockedUsersById(params) };
  }

  @Delete()
  async deleteUser(@CurrentUser() user: UserModel): Promise<UserModel> {
    return await this.userService.deleteUser(user);
  }

  @Delete("id/:id/")
  async deleteUserByOtherUser(
    @Params() params: FirebaseUidParam,
    @CurrentUser() user: UserModel,
  ): Promise<GetUserResponse> {
    return { user: await this.userService.deleteUserByOtherUser(user, params) };
  }

  @Post("softDelete/id/:id/")
  async softDeleteUser(
    @Params() params: FirebaseUidParam,
  ): Promise<GetUserResponse> {
    return { user: await this.userService.softDeleteUser(params) };
  }

  @Post("logout/")
  async logout(@Body() fcmToken: FcmTokenRequest): Promise<null> {
    return await this.userService.logout(fcmToken);
  }
}
