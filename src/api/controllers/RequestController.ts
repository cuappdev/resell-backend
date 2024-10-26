import { Body, CurrentUser, Delete, Get, JsonController, Params, Post } from 'routing-controllers';

import { UserModel } from '../../models/UserModel';
import { RequestService } from '../../services/RequestService';
import { CreateRequestRequest, GetPostsResponse, GetRequestResponse, GetRequestsResponse } from '../../types';
import { TimeParam, UuidParam } from '../validators/GenericRequests';
import { OpenAPI } from 'routing-controllers-openapi';

@JsonController('request/')
export class RequestController {
  private requestService: RequestService;

  constructor(requestService: RequestService) {
    this.requestService = requestService;
  }

  @Get()
  @OpenAPI({
    summary: 'Get all requests',
    description: 'Retrieves all requests',
    responses: {
      '200': { description: 'Requests returned successfully' },
    }
  })
  async getRequests(): Promise<GetRequestsResponse> {
    const request = await this.requestService.getAllRequest();
    return { requests: request.map((f) => f.getRequestInfo()) };
  }

  @Get('id/:id/')
  @OpenAPI({
    summary: 'Get request by id',
    description: 'Retrieves a request by its id',
    responses: {
      '200': { description: 'Request returned successfully' },
      '404': { description: 'Request not found' }
    }
  })
  async getRequestById(@Params() params: UuidParam): Promise<GetRequestResponse> {
    return { request: await this.requestService.getRequestById(params) };
  }

  @Get('userId/:id/')
  @OpenAPI({
    summary: 'Get requests by user id',
    description: 'Retrieves all requests by a user id',
    responses: {
      '200': { description: 'Requests returned successfully' },
      '404': { description: 'Requests not found' }
    }
  })
  async getRequestsByUserId(@Params() params: UuidParam): Promise<GetRequestsResponse> {
    return { requests: await this.requestService.getRequestByUserId(params) };
  }

  @Post()
  @OpenAPI({
    summary: 'Create new request',
    description: 'Creates a new request',
    responses: {
      '200': { description: 'Request created successfully' },
    }
  })
  async createRequest(@Body() createRequestRequest: CreateRequestRequest): Promise<GetRequestResponse> {
    return { request: await this.requestService.createRequest(createRequestRequest) };
  }

  @Delete('id/:id/')
  @OpenAPI({
    summary: 'Delete request',
    description: 'Deletes a request',
    responses: {
      '200': { description: 'Request deleted successfully' },
      '404': { description: 'Request not found' }
    }
  })
  async deleteRequestById(@Params() params: UuidParam): Promise<GetRequestResponse> {
    return { request: await this.requestService.deleteRequestById(params) };
  }

  @Post('archive/requestId/:id/')
  @OpenAPI({
    summary: 'Archive request',
    description: 'Archives a request',
    responses: {
      '200': { description: 'Request archived successfully' },
      '404': { description: 'Request not found' }
    }
  })
  async archiveRequest(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetRequestResponse> {
    return { request: await this.requestService.archiveRequest(user, params) };
  }

  @Post('archiveAll/userId/:id/')
  @OpenAPI({
    summary: 'Archive all requests by user id',
    description: 'Archives all requests by a user id',
    responses: {
      '200': { description: 'Requests archived successfully' },
      '404': { description: 'Requests not found' }
    }
  })
  async archiveAllRequestsByUserId(@Params() params: UuidParam): Promise<GetRequestsResponse> {
    return { requests: await this.requestService.archiveAllRequestsByUserId(params) };
  }

  @Get('matches/id/:id/:time?/')
  @OpenAPI({
    summary: 'Get matches by request id',
    description: 'Retrieves all matches by a request id',
    responses: {
      '200': { description: 'Matches returned successfully' },
      '404': { description: 'Matches not found' }
    }
  })
  async getMatchesByRequestId(@Params() params: TimeParam): Promise<GetPostsResponse> {
    return { posts: await this.requestService.getMatchesByRequestId(params) };
  }
}