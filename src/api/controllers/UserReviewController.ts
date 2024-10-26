import { Body, CurrentUser, Delete, Get, JsonController, Params, Post } from 'routing-controllers';
import { 
    CreateUserReviewRequest,
    GetUserReviewResponse,
    GetUserReviewsResponse
} from '../../types';
import { UserModel } from '../../models/UserModel';
import { UserReviewService } from '../../services/UserReviewService'
import { UuidParam } from '../validators/GenericRequests';
import { OpenAPI } from 'routing-controllers-openapi';

@JsonController('userReview/')
export class UserReviewController {
    private userReviewService: UserReviewService;

    constructor(userReviewService: UserReviewService) {
        this.userReviewService = userReviewService;
    }

    @Get()
    @OpenAPI({
        summary: 'Get all user reviews',
        description: 'Retrieves all user reviews',
        responses: {
            '200': { description: 'User reviews returned successfully' },
        }
    })
    async getUserReviews(): Promise<GetUserReviewsResponse> {
        return { userReviews: await this.userReviewService.getAllUserReviews() };
    }

    @Get('id/:id/')
    @OpenAPI({
        summary: 'Get user review by id',
        description: 'Retrieves a user review by its id',
        responses: {
            '200': { description: 'User review returned successfully' },
            '404': { description: 'User review not found' }
        }
    })
    async getUserReviewsById(@Params() params: UuidParam): Promise<GetUserReviewResponse> {
        return { userReview: await this.userReviewService.getUserReviewById(params) };
    }

    @Post()
    @OpenAPI({
        summary: 'Create new user review',
        description: 'Creates a new user review',
        responses: {
            '200': { description: 'User review created successfully' },
        }
    })
    async createUserReview(@Body() createUserReviewRequest: CreateUserReviewRequest): Promise<GetUserReviewResponse> {
        return { userReview: await this.userReviewService.createUserReview(createUserReviewRequest) };
    }

    @Delete('id/:id/')
    @OpenAPI({
        summary: 'Delete user review by id',
        description: 'Deletes a user review by its id',
        responses: {
            '200': { description: 'User review deleted successfully' },
            '404': { description: 'User review not found' }
        }
    })
    async deleteUserReview(@CurrentUser() buyer: UserModel, @Params() params: UuidParam): Promise<GetUserReviewResponse> {
        return { userReview: await this.userReviewService.deleteUserReviewById(buyer, params) };
    }
}