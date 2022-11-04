import { Body, Delete, Get, JsonController, Params, Post } from 'routing-controllers';

import { RequestService } from '../../services/RequestService';
import { CreateRequestRequest, GetPostsResponse, GetRequestResponse, GetRequestsResponse } from '../../types';
import { TimeParam, UuidParam } from '../validators/GenericRequests';

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

  @Get('matches/id/:id/:time?/')
  async getMatchesByRequestId(@Params() params: TimeParam): Promise<GetPostsResponse> {
    return { posts: await this.requestService.getMatchesByRequestId(params) };
  }
}