import { Body, Delete, Get, JsonController, Params, Post } from 'routing-controllers';

import { RequestService } from '../../services/RequestService';
import { CreateRequestRequest, GetRequestResponse, GetRequestsResponse } from '../../types';
import { UuidParam } from '../validators/GenericRequests';

@JsonController('request/')
export class RequestController {
  private requestService: RequestService;

  constructor(requestService: RequestService) {
    this.requestService = requestService;
  }

  @Get()
  async getAllRequest(): Promise<GetRequestsResponse> {
    const request = await this.requestService.getAllRequest();
    return { request: request.map((f) => f.getRequestInfo()) };
  }

  @Get('id/:id/')
  async getRequestById(@Params() params: UuidParam): Promise<GetRequestResponse> {
    return { request: await this.requestService.getRequestById(params) };
  }

  @Get('userId/:id/')
  async getRequestByUserId(@Params() params: UuidParam): Promise<GetRequestsResponse> {
    return { request: await this.requestService.getRequestByUserId(params) };
  }

  @Post()
  async createRequest(@Body() createRequestRequest: CreateRequestRequest): Promise<GetRequestResponse> {
    return { request: await this.requestService.createRequest(createRequestRequest) };
  }

  @Delete('id/:id/')
  async deletePostById(@Params() params: UuidParam): Promise<GetRequestResponse> {
    return { request: await this.requestService.deleteRequestById(params) };
  }
}