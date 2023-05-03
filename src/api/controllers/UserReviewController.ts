import { Body, CurrentUser, Delete, Get, JsonController, Params, Post } from 'routing-controllers';
import { 
    CreateUserReviewRequest,
    GetUserReviewResponse,
    GetUserReviewsResponse
} from 'src/types';
import { UserModel } from 'src/models/UserModel';
import { UserReviewService } from '../../services/UserReviewService'
import { UuidParam } from '../validators/GenericRequests';

@JsonController('userReview/')
export class UserReviewController {
    private userReviewService: UserReviewService;

    constructor(userReviewService: UserReviewService) {
        this.userReviewService = userReviewService;
    }

    @Get()
    async getUserReviews(): Promise<GetUserReviewsResponse> {
        return { userReviews: await this.userReviewService.getAllUserReviews() };
    }

    @Get('id/:id/')
    async getUserReviewsById(@Params() params: UuidParam): Promise<GetUserReviewResponse> {
        return { userReview: await this.userReviewService.getUserReviewById(params) };
    }

    @Post()
    async createUserReview(@Body() createUserReviewRequest: CreateUserReviewRequest): Promise<GetUserReviewResponse> {
        return { userReview: await this.userReviewService.createUserReview(createUserReviewRequest) };
    }

    @Delete('id/:id/')
    async deleteUserReview(@CurrentUser() buyer: UserModel, @Params() params: UuidParam): Promise<GetUserReviewResponse> {
        return { userReview: await this.userReviewService.deleteUserReviewById(buyer, params) };
    }
}