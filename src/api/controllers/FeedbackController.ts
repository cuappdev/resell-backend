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
    description: 'Gets all feedback.',
    responses: {
      '200': {
        description: 'Feedbacks returned successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                feedbacks: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { 
                        type: 'string',
                        example: '134841-42b4-4fdd-b074-jkfale'
                      },
                      description: { 
                        type: 'string',
                        example: 'I love the app'
                      },
                      images: {
                        type: 'array',
                        items: {
                          type: 'string',
                          example: 'https://img2.png'
                        }
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
  async getAllFeedback(): Promise<GetFeedbacksResponse> {
    const feedback = await this.feedbackService.getAllFeedback();
    return { feedbacks: feedback.map((f) => f.getFeedbackInfo()) };
  }

  @Get('id/:id/')
  @OpenAPI({
    summary: 'Get feedback by id',
    description: 'Gets feedback with id of :id. These ids are specific to our own backend.',
    responses: {
      '200': {
        description: 'Feedback returned successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                feedback: {
                  type: 'object',
                  properties: {
                    id: { 
                      type: 'string',
                      example: '134841-42b4-4fdd-b074-jkfale'
                    },
                    description: { 
                      type: 'string',
                      example: 'I love the app'
                    },
                    images: {
                      type: 'array',
                      items: {
                        type: 'string',
                        example: 'https://img2.png'
                      }
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
      },
      '404': {
        description: 'Feedback not found'
      }
    }
  })
  async getFeedbackById(@Params() params: UuidParam): Promise<GetFeedbackResponse> {
    return { feedback: await this.feedbackService.getFeedbackById(params) };
  }

  @Get('userId/:id/')
  @OpenAPI({
    summary: 'Get feedback by id',
    description: 'Gets feedback with userId of :id. These ids are specific to our own backend.',
    responses: {
      '200': {
        description: 'Feedback returned successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                feedback: {
                  type: 'object',
                  properties: {
                    id: { 
                      type: 'string',
                      example: '134841-42b4-4fdd-b074-jkfale'
                    },
                    description: { 
                      type: 'string',
                      example: 'I love the app'
                    },
                    images: {
                      type: 'array',
                      items: {
                        type: 'string',
                        example: 'https://img2.png'
                      }
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
      },
      '404': {
        description: 'Feedback not found'
      }
    }
  })
  async getFeedbackByUserId(@Params() params: UuidParam): Promise<GetFeedbacksResponse> {
    return { feedbacks: await this.feedbackService.getFeedbackByUserId(params) };
  }

  @Post()
  @OpenAPI({
    summary: 'Create new feedback',
    description: 'Creates feedback using request body.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['description', 'userId'],
            properties: {
              description: {
                type: 'string',
                example: 'I love the app'
              },
              images: {
                type: 'array',
                items: {
                  type: 'string',
                  example: 'https://img2.png'
                }
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
        description: 'Feedback created successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                feedback: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    description: { type: 'string' },
                    images: {
                      type: 'array',
                      items: { type: 'string' }
                    },
                    user: {
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
                    }
                  }
                }
              }
            }
          }
        }
      },
      '400': {
        description: 'Invalid request body'
      }
    }
  })
  async createFeedback(@Body() createFeedbackRequest: CreateFeedbackRequest): Promise<GetFeedbackResponse> {
    return { feedback: await this.feedbackService.createFeedback(createFeedbackRequest) };
  }

  @Delete('id/:id/')
  @OpenAPI({
    summary: 'Delete feedback',
    description: 'Deletes feedback with id of :id.',
    responses: {
      '200': {
        description: 'Feedback deleted successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: true
                },
                feedback: {
                  type: 'object',
                  properties: {
                    id: { 
                      type: 'string',
                      example: '134841-42b4-4fdd-b074-jkfale'
                    },
                    description: { 
                      type: 'string',
                      example: 'I love the app'
                    },
                    images: {
                      type: 'array',
                      items: {
                        type: 'string',
                        example: 'https://img2.png'
                      }
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
      },
      '404': {
        description: 'Feedback not found'
      }
    }
  })
  async deletePostById(@Params() params: UuidParam): Promise<GetFeedbackResponse> {
    return { feedback: await this.feedbackService.deleteFeedbackById(params) };
  }

  @Post('search/')
  @OpenAPI({
    summary: 'Search feedback',
    description: 'Gets feedback by search using request body.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['keyword'],
            properties: {
              keyword: {
                type: 'string',
                example: 'home screen'
              }
            }
          }
        }
      }
    },
    responses: {
      '200': {
        description: 'Feedbacks returned successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                feedbacks: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      description: { type: 'string' },
                      images: {
                        type: 'array',
                        items: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '400': {
        description: 'Invalid request body'
      }
    }
  })
  async searchFeedback(@Body() GetSearchedFeedbackRequest: GetSearchedFeedbackRequest): Promise<GetFeedbacksResponse> {
    return { feedbacks: await this.feedbackService.searchFeedback(GetSearchedFeedbackRequest) };
  }
}