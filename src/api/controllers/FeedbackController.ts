import { Body, Delete, Get, JsonController, Params, Post } from 'routing-controllers';

import { FeedbackService } from '../../services/FeedbackService';
import { CreateFeedbackRequest, ErrorResponse, getErrorMessage, GetFeedbackResponse, GetFeedbacksResponse, GetSearchedFeedbackRequest } from '../../types';
import { UuidParam } from '../validators/GenericRequests';

@JsonController('feedback/')
export class FeedbackController {
  private feedbackService: FeedbackService;

  constructor(feedbackService: FeedbackService) {
    this.feedbackService = feedbackService;
  }

  @Get()
  async getAllFeedback(): Promise<GetFeedbacksResponse | ErrorResponse> {
    try {
      const feedback = await this.feedbackService.getAllFeedback();
      return { feedback: feedback.map((f) => f.getFeedbackInfo()) };
    } catch (error) {
      return { error: getErrorMessage(error) }
    }
  }

  @Get('id/:id/')
  async getFeedbackById(@Params() params: UuidParam): Promise<GetFeedbackResponse | ErrorResponse> {
    try {
      return { feedback: await this.feedbackService.getFeedbackById(params.id) };
    } catch (error) {
      return { error: getErrorMessage(error) }
    }
  }

  @Get('userId/:id/')
  async getFeedbackByUserId(@Params() params: UuidParam): Promise<GetFeedbacksResponse | ErrorResponse> {
    try {
      return { feedback: await this.feedbackService.getFeedbackByUserId(params.id) };
    } catch (error) {
      return { error: getErrorMessage(error) }
    }
  }

  @Post()
  async createPost(@Body() createFeedbackRequest: CreateFeedbackRequest): Promise<GetFeedbackResponse | ErrorResponse> {
    try {
      const feedback = await this.feedbackService.createFeedback(createFeedbackRequest);
    return { feedback: feedback };
    } catch (error) {
      return { error: getErrorMessage(error) }
    }
  }

  @Delete('id/:id/')
  async deletePostById(@Params() params: UuidParam): Promise<GetFeedbackResponse | ErrorResponse> {
    try {
      return { feedback: await this.feedbackService.deleteFeedbackById(params.id) };
    } catch (error) {
      return { error: getErrorMessage(error) }
    }
  }

  
  @Post('search/')
  async searchPosts(@Body() GetSearchedFeedbackRequest: GetSearchedFeedbackRequest): Promise<GetFeedbacksResponse | ErrorResponse> {
    try {
      return { feedback: await this.feedbackService.searchFeedback(GetSearchedFeedbackRequest) };
    } catch (error) {
      return { error: getErrorMessage(error) }
    }
  }
}