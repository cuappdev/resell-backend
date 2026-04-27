import {
  Body,
  CurrentUser,
  Delete,
  Get,
  JsonController,
  Params,
  Post,
  QueryParam,
} from 'routing-controllers';
import {
  CreateUserReviewRequest
} from '../../types';
import { UserModel } from '../../models/UserModel';
import { UserReviewModel } from '../../models/UserReviewModel';
import { UserReviewService } from '../../services/UserReviewService'
import { UuidParam } from '../validators/GenericRequests';

@JsonController("userReview/")
export class UserReviewController {
  private userReviewService: UserReviewService;

  constructor(userReviewService: UserReviewService) {
    this.userReviewService = userReviewService;
  }

  @Get()
  async getUserReviews(
    @QueryParam("sellerId") sellerId?: string,
  ): Promise<{ reviews: UserReviewModel[] }> {
    return {
      reviews: sellerId
        ? await this.userReviewService.getUserReviewsBySellerId(sellerId)
        : await this.userReviewService.getAllUserReviews(),
    };
  }

  @Get('id/:id/')
  async getUserReviewsById(@Params() params: UuidParam): Promise<{ review: UserReviewModel }> {
    return { review: await this.userReviewService.getUserReviewById(params) };
  }

  @Post()
  async createUserReview(@Body() createUserReviewRequest: CreateUserReviewRequest): Promise<{ review: UserReviewModel }> {
    return { review: await this.userReviewService.createUserReview(createUserReviewRequest) };
  }

  @Delete('id/:id/')
  async deleteUserReview(@CurrentUser() buyer: UserModel, @Params() params: UuidParam): Promise<{ review: UserReviewModel }> {
    return { review: await this.userReviewService.deleteUserReviewById(buyer, params) };
  }
}
