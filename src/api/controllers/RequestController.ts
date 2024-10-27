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
    description: 'Gets all requests.',
    responses: {
      '200': {
        description: 'Requests returned successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                requests: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { 
                        type: 'string',
                        example: 'dsfandjk-42b4-4fdd-b074-jkfale'
                      },
                      title: { 
                        type: 'string',
                        example: '3110 Textbook'
                      },
                      description: { 
                        type: 'string',
                        example: 'Textbook for Clarkson\'s 3110'
                      },
                      user: {
                        type: 'object',
                        properties: {
                          id: { 
                            type: 'string',
                            example: '381527oejf-42b4-4fdd-b074-dfwbejko229'
                          },
                          firstName: { 
                            type: 'string',
                            example: 'Mateo'
                          },
                          lastName: { 
                            type: 'string',
                            example: 'Weiner'
                          },
                          profilePicUrl: { 
                            type: 'string',
                            example: 'https://img1.png'
                          },
                          venmoHandle: { 
                            type: 'string',
                            example: 'mateoweiner'
                          },
                          email: { 
                            type: 'string',
                            example: 'mateow99@gmail.com'
                          },
                          googleId: { 
                            type: 'string',
                            example: '21438528358713851'
                          },
                          bio: { 
                            type: 'string',
                            example: 'Freshman studying CS. He/Him'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  async getRequests(): Promise<GetRequestsResponse> {
    const request = await this.requestService.getAllRequest();
    return { requests: request.map((f) => f.getRequestInfo()) };
  }

  @Get('id/:id/')
  @OpenAPI({
    summary: 'Get request by id',
    description: 'Gets request with id of :id. These ids are specific to our own backend.',
    responses: {
      '200': {
        description: 'Request returned successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                request: {
                  type: 'object',
                  properties: {
                    id: { 
                      type: 'string',
                      example: 'dsfandjk-42b4-4fdd-b074-jkfale'
                    },
                    title: { 
                      type: 'string',
                      example: '3110 Textbook'
                    },
                    description: { 
                      type: 'string',
                      example: 'Textbook for Clarkson\'s 3110'
                    }
                  }
                }
              }
            }
          }
        }
      },
      '404': {
        description: 'Request not found'
      }
    }
  })
  async getRequestById(@Params() params: UuidParam): Promise<GetRequestResponse> {
    return { request: await this.requestService.getRequestById(params) };
  }

  @Get('userId/:id/')
  @OpenAPI({
    summary: 'Get request by userId',
    description: 'Gets request with userId of :id. These ids are specific to our own backend.',
    responses: {
      '200': {
        description: 'Request returned successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                request: {
                  type: 'object',
                  properties: {
                    id: { 
                      type: 'string',
                      example: 'dsfandjk-42b4-4fdd-b074-jkfale'
                    },
                    title: { 
                      type: 'string',
                      example: '3110 Textbook'
                    },
                    description: { 
                      type: 'string',
                      example: 'Textbook for Clarkson\'s 3110'
                    }
                  }
                }
              }
            }
          }
        }
      },
      '404': {
        description: 'Request not found'
      }
    }
  })
  async getRequestsByUserId(@Params() params: UuidParam): Promise<GetRequestsResponse> {
    return { requests: await this.requestService.getRequestByUserId(params) };
  }

  @Post()
  @OpenAPI({
    summary: 'Create new request',
    description: 'Creates request using request body.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['title', 'description', 'userId'],
            properties: {
              title: {
                type: 'string',
                example: '3110 Textbook'
              },
              description: {
                type: 'string',
                example: 'Textbook for Clarkson\'s 3110'
              },
              userId: {
                type: 'string',
                example: '381527oejf-42b4-4fdd-b074-dfwbejko229'
              }
            }
          }
        }
      }
    },
    responses: {
      '200': {
        description: 'Request created successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                request: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    userId: { type: 'string' },
                    matches: {
                      type: 'array',
                      items: { type: 'object' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  async createRequest(@Body() createRequestRequest: CreateRequestRequest): Promise<GetRequestResponse> {
    return { request: await this.requestService.createRequest(createRequestRequest) };
  }

  @Delete('id/:id/')
  @OpenAPI({
    summary: 'Delete request',
    description: 'Deletes request with id of :id.',
    responses: {
      '200': {
        description: 'Request deleted successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                request: {
                  type: 'object',
                  properties: {
                    id: { 
                      type: 'string',
                      example: 'dsfandjk-42b4-4fdd-b074-jkfale'
                    },
                    title: { 
                      type: 'string',
                      example: '3110 Textbook'
                    },
                    description: { 
                      type: 'string',
                      example: 'Textbook for Clarkson\'s 3110'
                    }
                  }
                }
              }
            }
          }
        }
      },
      '404': {
        description: 'Request not found'
      }
    }
  })
  async deleteRequestById(@Params() params: UuidParam): Promise<GetRequestResponse> {
    return { request: await this.requestService.deleteRequestById(params) };
  }

  @Post('archive/requestId/:id/')
  @OpenAPI({
    summary: 'Archive request',
    description: 'Gets and archives request with id :id for the logged in user',
    responses: {
      '200': {
        description: 'Request archived successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                request: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    archived: { type: 'boolean', example: true }
                  }
                }
              }
            }
          }
        }
      },
      '404': {
        description: 'Request not found'
      }
    }
  })
  async archiveRequest(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetRequestResponse> {
    return { request: await this.requestService.archiveRequest(user, params) };
  }

  @Post('archiveAll/userId/:id/')
  @OpenAPI({
    summary: 'Archive all requests by user ID',
    description: 'Archives all requests by a user with id :id',
    responses: {
      '200': {
        description: 'Requests archived successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                requests: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      title: { type: 'string' },
                      description: { type: 'string' },
                      archived: { type: 'boolean', example: true }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '404': {
        description: 'User not found'
      }
    }
  })
  async archiveAllRequestsByUserId(@Params() params: UuidParam): Promise<GetRequestsResponse> {
    return { requests: await this.requestService.archiveAllRequestsByUserId(params) };
  }

  @Get('matches/id/:id/:time?/')
  @OpenAPI({
    summary: 'Get matches by request id',
    description: 'Gets posts that match the request with id of :id. The last part of the URL is optional. If left blank it will get all matches regardless of time. If used it specifies getting posts on or after that date. The format goes YYYYMMDD so 20220910 would be September 10th, 2022, and gets posts on or after the 10th.',
    responses: {
      '200': {
        description: 'Matches returned successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                request: {
                  type: 'object',
                  properties: {
                    id: { 
                      type: 'string',
                      example: 'dsfandjk-42b4-4fdd-b074-jkfale'
                    },
                    title: { 
                      type: 'string',
                      example: '3110 Textbook'
                    },
                    description: { 
                      type: 'string',
                      example: 'Textbook for Clarkson\'s 3110'
                    },
                    userId: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        profilePicUrl: { type: 'string' },
                        venmoHandle: { type: 'string' },
                        email: { type: 'string' },
                        googleId: { type: 'string' },
                        bio: { type: 'string' }
                      }
                    },
                    matches: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          title: { type: 'string' },
                          description: { type: 'string' },
                          categories: { type: 'string' },
                          archive: { type: 'boolean' },
                          price: { type: 'number' },
                          images: {
                            type: 'array',
                            items: { type: 'string' }
                          },
                          location: { type: 'string' },
                          user: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              firstName: { type: 'string' },
                              lastName: { type: 'string' },
                              admin: { type: 'boolean' },
                              profilePicUrl: { type: 'string' },
                              venmoHandle: { type: 'string' },
                              email: { type: 'string' },
                              googleId: { type: 'string' },
                              bio: { type: 'string' }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '404': {
        description: 'Request not found'
      }
    }
  })
  async getMatchesByRequestId(@Params() params: TimeParam): Promise<GetPostsResponse> {
    return { posts: await this.requestService.getMatchesByRequestId(params) };
  }
}