import { Body, Delete, Get, JsonController, Params, Post } from 'routing-controllers';

import { RequestService } from '../../services/RequestService';
import { CreateRequestRequest, GetMatchesRequest, GetPostsResponse, GetRequestResponse, GetRequestsResponse, Uuid } from '../../types';
import { UuidParam } from '../validators/GenericRequests';

@JsonController('request/')
export class RequestController {
  private requestService: RequestService;

  constructor(requestService: RequestService) {
    this.requestService = requestService;
  }

  @Get()
  async getRequests(): Promise<GetRequestsResponse> {
    const request = await this.requestService.getAllRequest();
    return { requests: request.map((f) => f.getRequestInfo()) };
  }

  @Get('id/:id/')
  async getRequestById(@Params() params: UuidParam): Promise<GetRequestResponse> {
    return { request: await this.requestService.getRequestById(params) };
  }

  @Get('userId/:id/')
  async getRequestsByUserId(@Params() params: UuidParam): Promise<GetRequestsResponse> {
    return { requests: await this.requestService.getRequestByUserId(params) };
  }

  @Post()
  async createRequest(@Body() createRequestRequest: CreateRequestRequest): Promise<GetRequestResponse> {
    return { request: await this.requestService.createRequest(createRequestRequest) };
  }

  @Delete('id/:id/')
  async deleteRequestById(@Params() params: UuidParam): Promise<GetRequestResponse> {
    return { request: await this.requestService.deleteRequestById(params) };
  }

  @Post('matches/id/:id/')
  async getMatchesByRequestId(@Body() getMatchesRequest: GetMatchesRequest, @Params() params: UuidParam): Promise<GetPostsResponse> {
    return { posts: await this.requestService.getMatchesByRequestId(params, getMatchesRequest) };
  }
}