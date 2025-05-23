import { Body, Delete, Get, JsonController, Params, Post } from 'routing-controllers';

import { FeedbackService } from '../../services/FeedbackService';
import { CreateFeedbackRequest, GetFeedbackResponse, GetFeedbacksResponse, GetSearchedFeedbackRequest } from '../../types';
import { UuidParam, FirebaseUidParam } from '../validators/GenericRequests';

@JsonController('feedback/')
export class FeedbackController {
  private feedbackService: FeedbackService;

  constructor(feedbackService: FeedbackService) {
    this.feedbackService = feedbackService;
  }

  @Get()
  async getAllFeedback(): Promise<GetFeedbacksResponse> {
    const feedback = await this.feedbackService.getAllFeedback();
    return { feedbacks: feedback.map((f) => f.getFeedbackInfo()) };
  }

  @Get('id/:id/')
  async getFeedbackById(@Params() params: UuidParam): Promise<GetFeedbackResponse> {
    return { feedback: await this.feedbackService.getFeedbackById(params) };
  }

  @Get('userId/:id/')
  async getFeedbackByUserId(@Params() params: FirebaseUidParam): Promise<GetFeedbacksResponse> {
    return { feedbacks: await this.feedbackService.getFeedbackByUserId(params) };
  }

  @Post()
  async createFeedback(@Body() createFeedbackRequest: CreateFeedbackRequest): Promise<GetFeedbackResponse> {
    return { feedback: await this.feedbackService.createFeedback(createFeedbackRequest) };
  }

  @Delete('id/:id/')
  async deletePostById(@Params() params: UuidParam): Promise<GetFeedbackResponse> {
    return { feedback: await this.feedbackService.deleteFeedbackById(params) };
  }

  @Post('search/')
  async searchFeedback(@Body() GetSearchedFeedbackRequest: GetSearchedFeedbackRequest): Promise<GetFeedbacksResponse> {
    return { feedbacks: await this.feedbackService.searchFeedback(GetSearchedFeedbackRequest) };
  }
}