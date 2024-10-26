import { Body, Delete, Get, JsonController, Params, Post } from 'routing-controllers';

import { FeedbackService } from '../../services/FeedbackService';
import { CreateFeedbackRequest, GetFeedbackResponse, GetFeedbacksResponse, GetSearchedFeedbackRequest } from '../../types';
import { UuidParam } from '../validators/GenericRequests';
import { OpenAPI } from 'routing-controllers-openapi';

@JsonController('feedback/')
export class FeedbackController {
  private feedbackService: FeedbackService;

  constructor(feedbackService: FeedbackService) {
    this.feedbackService = feedbackService;
  }

  @Get()
  @OpenAPI({
    summary: 'Get all feedback',
    description: 'Retrieves all feedbacks',
    responses: {
      '200': { description: 'Feedbacks returned successfully' },
    }
  })
  async getAllFeedback(): Promise<GetFeedbacksResponse> {
    const feedback = await this.feedbackService.getAllFeedback();
    return { feedbacks: feedback.map((f) => f.getFeedbackInfo()) };
  }

  @Get('id/:id/')
  @OpenAPI({
    summary: 'Get feedback by id',
    description: 'Retrieves a feedback by its id',
    responses: {
      '200': { description: 'Feedback returned successfully' },
      '404': { description: 'Feedback not found' }
    }
  })
  async getFeedbackById(@Params() params: UuidParam): Promise<GetFeedbackResponse> {
    return { feedback: await this.feedbackService.getFeedbackById(params) };
  }

  @Get('userId/:id/')
  @OpenAPI({
    summary: 'Get feedback by user id',
    description: 'Retrieves all feedbacks by a user id',
    responses: {
      '200': { description: 'Feedbacks returned successfully' },
      '404': { description: 'Feedbacks not found' }
    }
  })
  async getFeedbackByUserId(@Params() params: UuidParam): Promise<GetFeedbacksResponse> {
    return { feedbacks: await this.feedbackService.getFeedbackByUserId(params) };
  }

  @Post()
  @OpenAPI({
    summary: 'Create new feedback',
    description: 'Creates a new feedback',
    responses: {
      '200': { description: 'Feedback created successfully' },
      '400': { description: 'Invalid request body' }
    }
  })
  async createFeedback(@Body() createFeedbackRequest: CreateFeedbackRequest): Promise<GetFeedbackResponse> {
    return { feedback: await this.feedbackService.createFeedback(createFeedbackRequest) };
  }

  @Delete('id/:id/')
  @OpenAPI({
    summary: 'Delete feedback',
    description: 'Deletes a feedback by its id',
    responses: {
      '200': { description: 'Feedback deleted successfully' },
      '404': { description: 'Feedback not found' }
    }
  })
  async deletePostById(@Params() params: UuidParam): Promise<GetFeedbackResponse> {
    return { feedback: await this.feedbackService.deleteFeedbackById(params) };
  }

  @Post('search/')
  @OpenAPI({
    summary: 'Search feedback',
    description: 'Searches for feedbacks',
    responses: {
      '200': { description: 'Feedbacks returned successfully' },
      '400': { description: 'Invalid request body' }
    }
  })
  async searchFeedback(@Body() GetSearchedFeedbackRequest: GetSearchedFeedbackRequest): Promise<GetFeedbacksResponse> {
    return { feedbacks: await this.feedbackService.searchFeedback(GetSearchedFeedbackRequest) };
  }
}