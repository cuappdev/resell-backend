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
        description: 'Gets all user reviews.',
        responses: {
          '200': {
            description: 'User reviews returned successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    userReviews: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { 
                            type: 'string',
                            example: '1e900348-df68-42b3-a8c9-270205575314'
                          },
                          fulfilled: { 
                            type: 'boolean',
                            example: true
                          },
                          stars: { 
                            type: 'number',
                            example: 4
                          },
                          comments: { 
                            type: 'string',
                            example: 'Great experience!!'
                          },
                          date: { 
                            type: 'string',
                            format: 'date-time',
                            example: '2023-05-03T16:16:56.857Z'
                          },
                          buyer: {
                            type: 'object',
                            properties: {
                              id: { 
                                type: 'string',
                                format: 'uuid',
                                example: '7d98989b-42b4-4fdd-b074-0c704ab51e0c'
                              },
                              username: { 
                                type: 'string',
                                example: 'mweiner'
                              },
                              netid: { 
                                type: 'string',
                                example: 'maw346'
                              },
                              givenName: { 
                                type: 'string',
                                example: 'Mateo'
                              },
                              familyName: { 
                                type: 'string',
                                example: 'Weiner'
                              },
                              admin: { 
                                type: 'boolean',
                                example: false
                              },
                              stars: { 
                                type: 'string',
                                example: '4.5'
                              },
                              numReviews: { 
                                type: 'integer',
                                example: 10
                              },
                              photoUrl: { 
                                type: 'string',
                                nullable: true,
                                example: 'https://img1.png'
                              },
                              venmoHandle: { 
                                type: 'string',
                                nullable: true,
                                example: '@mateoweiner'
                              },
                              email: { 
                                type: 'string',
                                format: 'email',
                                example: 'maw346@cornell.edu'
                              },
                              googleId: { 
                                type: 'string',
                                example: '21438528358713851'
                              },
                              bio: { 
                                type: 'string',
                                example: 'Freshman studying CS. He/Him'
                              },
                              isActive: { 
                                type: 'boolean',
                                example: true
                              },
                              blocking: {
                                type: 'array',
                                items: {
                                  type: 'string',
                                  format: 'uuid'
                                }
                              },
                              blockers: {
                                type: 'array',
                                items: {
                                  type: 'string',
                                  format: 'uuid'
                                }
                              },
                              reports: {
                                type: 'array',
                                items: {
                                  type: 'string',
                                  format: 'uuid'
                                }
                              },
                              reportedBy: {
                                type: 'array',
                                items: {
                                  type: 'string',
                                  format: 'uuid'
                                }
                              },
                              posts: {
                                type: 'array',
                                items: {
                                  type: 'string',
                                  format: 'uuid'
                                }
                              },
                              feedbacks: {
                                type: 'array',
                                items: {
                                  type: 'string',
                                  format: 'uuid'
                                }
                              }
                            }
                          },
                          seller: {
                            type: 'object',
                            properties: {
                              id: { 
                                type: 'string',
                                format: 'uuid',
                                example: '7d98989b-42b4-4fdd-b074-0c704ab51e0c'
                              },
                              username: { 
                                type: 'string',
                                example: 'mweiner'
                              },
                              netid: { 
                                type: 'string',
                                example: 'maw346'
                              },
                              givenName: { 
                                type: 'string',
                                example: 'Mateo'
                              },
                              familyName: { 
                                type: 'string',
                                example: 'Weiner'
                              },
                              admin: { 
                                type: 'boolean',
                                example: false
                              },
                              stars: { 
                                type: 'string',
                                example: '4.5'
                              },
                              numReviews: { 
                                type: 'integer',
                                example: 10
                              },
                              photoUrl: { 
                                type: 'string',
                                nullable: true,
                                example: 'https://img1.png'
                              },
                              venmoHandle: { 
                                type: 'string',
                                nullable: true,
                                example: '@mateoweiner'
                              },
                              email: { 
                                type: 'string',
                                format: 'email',
                                example: 'maw346@cornell.edu'
                              },
                              googleId: { 
                                type: 'string',
                                example: '21438528358713851'
                              },
                              bio: { 
                                type: 'string',
                                example: 'Freshman studying CS. He/Him'
                              },
                              isActive: { 
                                type: 'boolean',
                                example: true
                              },
                              blocking: {
                                type: 'array',
                                items: {
                                  type: 'string',
                                  format: 'uuid'
                                }
                              },
                              blockers: {
                                type: 'array',
                                items: {
                                  type: 'string',
                                  format: 'uuid'
                                }
                              },
                              reports: {
                                type: 'array',
                                items: {
                                  type: 'string',
                                  format: 'uuid'
                                }
                              },
                              reportedBy: {
                                type: 'array',
                                items: {
                                  type: 'string',
                                  format: 'uuid'
                                }
                              },
                              posts: {
                                type: 'array',
                                items: {
                                  type: 'string',
                                  format: 'uuid'
                                }
                              },
                              feedbacks: {
                                type: 'array',
                                items: {
                                  type: 'string',
                                  format: 'uuid'
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
        }
      })
    async getUserReviews(): Promise<GetUserReviewsResponse> {
        return { userReviews: await this.userReviewService.getAllUserReviews() };
    }

    @Get('id/:id/')
    @OpenAPI({
        summary: 'Get user review by id',
        description: 'Gets user review with id of :id.',
        responses: {
          '200': {
            description: 'User review returned successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    userReview: {
                      type: 'object',
                      properties: {
                        id: { 
                          type: 'string',
                          example: '1e900348-df68-42b3-a8c9-270205575314'
                        },
                        fulfilled: { 
                          type: 'boolean',
                          example: true
                        },
                        stars: { 
                          type: 'number',
                          example: 4
                        },
                        comments: { 
                          type: 'string',
                          example: 'Great experience!!'
                        },
                        date: { 
                          type: 'string',
                          format: 'date-time',
                          example: '2023-05-03T16:16:56.857Z'
                        },
                        buyer: {
                          type: 'object',
                          properties: {
                            id: { 
                              type: 'string',
                              format: 'uuid',
                              example: '7d98989b-42b4-4fdd-b074-0c704ab51e0c'
                            },
                            username: { 
                              type: 'string',
                              example: 'mweiner'
                            },
                            netid: { 
                              type: 'string',
                              example: 'maw346'
                            },
                            givenName: { 
                              type: 'string',
                              example: 'Mateo'
                            },
                            familyName: { 
                              type: 'string',
                              example: 'Weiner'
                            },
                            admin: { 
                              type: 'boolean',
                              example: false
                            },
                            stars: { 
                              type: 'string',
                              example: '4.5'
                            },
                            numReviews: { 
                              type: 'integer',
                              example: 10
                            },
                            photoUrl: { 
                              type: 'string',
                              nullable: true,
                              example: 'https://img1.png'
                            },
                            venmoHandle: { 
                              type: 'string',
                              nullable: true,
                              example: '@mateoweiner'
                            },
                            email: { 
                              type: 'string',
                              format: 'email',
                              example: 'maw346@cornell.edu'
                            },
                            googleId: { 
                              type: 'string',
                              example: '21438528358713851'
                            },
                            bio: { 
                              type: 'string',
                              example: 'Freshman studying CS. He/Him'
                            },
                            isActive: { 
                              type: 'boolean',
                              example: true
                            },
                            blocking: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            blockers: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            reports: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            reportedBy: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            posts: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            feedbacks: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            }
                          }
                        },
                        seller: {
                          type: 'object',
                          properties: {
                            id: { 
                              type: 'string',
                              format: 'uuid',
                              example: '7d98989b-42b4-4fdd-b074-0c704ab51e0c'
                            },
                            username: { 
                              type: 'string',
                              example: 'mweiner'
                            },
                            netid: { 
                              type: 'string',
                              example: 'maw346'
                            },
                            givenName: { 
                              type: 'string',
                              example: 'Mateo'
                            },
                            familyName: { 
                              type: 'string',
                              example: 'Weiner'
                            },
                            admin: { 
                              type: 'boolean',
                              example: false
                            },
                            stars: { 
                              type: 'string',
                              example: '4.5'
                            },
                            numReviews: { 
                              type: 'integer',
                              example: 10
                            },
                            photoUrl: { 
                              type: 'string',
                              nullable: true,
                              example: 'https://img1.png'
                            },
                            venmoHandle: { 
                              type: 'string',
                              nullable: true,
                              example: '@mateoweiner'
                            },
                            email: { 
                              type: 'string',
                              format: 'email',
                              example: 'maw346@cornell.edu'
                            },
                            googleId: { 
                              type: 'string',
                              example: '21438528358713851'
                            },
                            bio: { 
                              type: 'string',
                              example: 'Freshman studying CS. He/Him'
                            },
                            isActive: { 
                              type: 'boolean',
                              example: true
                            },
                            blocking: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            blockers: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            reports: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            reportedBy: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            posts: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            feedbacks: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
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
            description: 'User review not found'
          }
        }
      })
    async getUserReviewsById(@Params() params: UuidParam): Promise<GetUserReviewResponse> {
        return { userReview: await this.userReviewService.getUserReviewById(params) };
    }

    @Post()
    @OpenAPI({
        summary: 'Create new user review',
        description: 'Creates a user review.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fulfilled', 'stars', 'comments', 'buyerId', 'sellerId'],
                properties: {
                  fulfilled: {
                    type: 'boolean',
                    example: true
                  },
                  stars: {
                    type: 'number',
                    example: 4
                  },
                  comments: {
                    type: 'string',
                    example: 'Great experience!!'
                  },
                  buyerId: {
                    type: 'string',
                    example: '3d7b876e-d624-441f-9d4b-aac53e362046'
                  },
                  sellerId: {
                    type: 'string',
                    example: 'aa9d68d1-8bef-43c5-b71b-ffa53698dfbd'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'User review created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    userReview: {
                      type: 'object',
                      properties: {
                        id: { 
                          type: 'string',
                          example: '1e900348-df68-42b3-a8c9-270205575314'
                        },
                        fulfilled: { 
                          type: 'boolean',
                          example: true
                        },
                        stars: { 
                          type: 'number',
                          example: 4
                        },
                        comments: { 
                          type: 'string',
                          example: 'Great experience!!'
                        },
                        date: { 
                          type: 'string',
                          format: 'date-time',
                          example: '2023-05-03T16:16:56.857Z'
                        },
                        buyer: {
                          type: 'object',
                          properties: {
                            id: { 
                              type: 'string',
                              format: 'uuid',
                              example: '7d98989b-42b4-4fdd-b074-0c704ab51e0c'
                            },
                            username: { 
                              type: 'string',
                              example: 'mweiner'
                            },
                            netid: { 
                              type: 'string',
                              example: 'maw346'
                            },
                            givenName: { 
                              type: 'string',
                              example: 'Mateo'
                            },
                            familyName: { 
                              type: 'string',
                              example: 'Weiner'
                            },
                            admin: { 
                              type: 'boolean',
                              example: false
                            },
                            stars: { 
                              type: 'string',
                              example: '4.5'
                            },
                            numReviews: { 
                              type: 'integer',
                              example: 10
                            },
                            photoUrl: { 
                              type: 'string',
                              nullable: true,
                              example: 'https://img1.png'
                            },
                            venmoHandle: { 
                              type: 'string',
                              nullable: true,
                              example: '@mateoweiner'
                            },
                            email: { 
                              type: 'string',
                              format: 'email',
                              example: 'maw346@cornell.edu'
                            },
                            googleId: { 
                              type: 'string',
                              example: '21438528358713851'
                            },
                            bio: { 
                              type: 'string',
                              example: 'Freshman studying CS. He/Him'
                            },
                            isActive: { 
                              type: 'boolean',
                              example: true
                            },
                            blocking: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            blockers: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            reports: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            reportedBy: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            posts: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            feedbacks: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            }
                          }
                        },
                        seller: {
                          type: 'object',
                          properties: {
                            id: { 
                              type: 'string',
                              format: 'uuid',
                              example: '7d98989b-42b4-4fdd-b074-0c704ab51e0c'
                            },
                            username: { 
                              type: 'string',
                              example: 'mweiner'
                            },
                            netid: { 
                              type: 'string',
                              example: 'maw346'
                            },
                            givenName: { 
                              type: 'string',
                              example: 'Mateo'
                            },
                            familyName: { 
                              type: 'string',
                              example: 'Weiner'
                            },
                            admin: { 
                              type: 'boolean',
                              example: false
                            },
                            stars: { 
                              type: 'string',
                              example: '4.5'
                            },
                            numReviews: { 
                              type: 'integer',
                              example: 10
                            },
                            photoUrl: { 
                              type: 'string',
                              nullable: true,
                              example: 'https://img1.png'
                            },
                            venmoHandle: { 
                              type: 'string',
                              nullable: true,
                              example: '@mateoweiner'
                            },
                            email: { 
                              type: 'string',
                              format: 'email',
                              example: 'maw346@cornell.edu'
                            },
                            googleId: { 
                              type: 'string',
                              example: '21438528358713851'
                            },
                            bio: { 
                              type: 'string',
                              example: 'Freshman studying CS. He/Him'
                            },
                            isActive: { 
                              type: 'boolean',
                              example: true
                            },
                            blocking: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            blockers: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            reports: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            reportedBy: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            posts: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            feedbacks: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
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
    async createUserReview(@Body() createUserReviewRequest: CreateUserReviewRequest): Promise<GetUserReviewResponse> {
        return { userReview: await this.userReviewService.createUserReview(createUserReviewRequest) };
    }

    @Delete('id/:id/')
    @OpenAPI({
        summary: 'Delete user review',
        description: 'Deletes user review with id of :id.',
        responses: {
          '200': {
            description: 'User review deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    userReview: {
                      type: 'object',
                      properties: {
                        id: { 
                          type: 'string',
                          example: '1e900348-df68-42b3-a8c9-270205575314'
                        },
                        fulfilled: { 
                          type: 'boolean',
                          example: true
                        },
                        stars: { 
                          type: 'number',
                          example: 4
                        },
                        comments: { 
                          type: 'string',
                          example: 'Great experience!!'
                        },
                        date: { 
                          type: 'string',
                          format: 'date-time',
                          example: '2023-05-03T16:16:56.857Z'
                        },
                        buyer: {
                          type: 'object',
                          properties: {
                            id: { 
                              type: 'string',
                              format: 'uuid',
                              example: '7d98989b-42b4-4fdd-b074-0c704ab51e0c'
                            },
                            username: { 
                              type: 'string',
                              example: 'mweiner'
                            },
                            netid: { 
                              type: 'string',
                              example: 'maw346'
                            },
                            givenName: { 
                              type: 'string',
                              example: 'Mateo'
                            },
                            familyName: { 
                              type: 'string',
                              example: 'Weiner'
                            },
                            admin: { 
                              type: 'boolean',
                              example: false
                            },
                            stars: { 
                              type: 'string',
                              example: '4.5'
                            },
                            numReviews: { 
                              type: 'integer',
                              example: 10
                            },
                            photoUrl: { 
                              type: 'string',
                              nullable: true,
                              example: 'https://img1.png'
                            },
                            venmoHandle: { 
                              type: 'string',
                              nullable: true,
                              example: '@mateoweiner'
                            },
                            email: { 
                              type: 'string',
                              format: 'email',
                              example: 'maw346@cornell.edu'
                            },
                            googleId: { 
                              type: 'string',
                              example: '21438528358713851'
                            },
                            bio: { 
                              type: 'string',
                              example: 'Freshman studying CS. He/Him'
                            },
                            isActive: { 
                              type: 'boolean',
                              example: true
                            },
                            blocking: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            blockers: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            reports: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            reportedBy: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            posts: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            feedbacks: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            }
                          }
                        },
                        seller: {
                          type: 'object',
                          properties: {
                            id: { 
                              type: 'string',
                              format: 'uuid',
                              example: '7d98989b-42b4-4fdd-b074-0c704ab51e0c'
                            },
                            username: { 
                              type: 'string',
                              example: 'mweiner'
                            },
                            netid: { 
                              type: 'string',
                              example: 'maw346'
                            },
                            givenName: { 
                              type: 'string',
                              example: 'Mateo'
                            },
                            familyName: { 
                              type: 'string',
                              example: 'Weiner'
                            },
                            admin: { 
                              type: 'boolean',
                              example: false
                            },
                            stars: { 
                              type: 'string',
                              example: '4.5'
                            },
                            numReviews: { 
                              type: 'integer',
                              example: 10
                            },
                            photoUrl: { 
                              type: 'string',
                              nullable: true,
                              example: 'https://img1.png'
                            },
                            venmoHandle: { 
                              type: 'string',
                              nullable: true,
                              example: '@mateoweiner'
                            },
                            email: { 
                              type: 'string',
                              format: 'email',
                              example: 'maw346@cornell.edu'
                            },
                            googleId: { 
                              type: 'string',
                              example: '21438528358713851'
                            },
                            bio: { 
                              type: 'string',
                              example: 'Freshman studying CS. He/Him'
                            },
                            isActive: { 
                              type: 'boolean',
                              example: true
                            },
                            blocking: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            blockers: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            reports: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            reportedBy: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            posts: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
                              }
                            },
                            feedbacks: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'uuid'
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
            description: 'User review not found'
          }
        }
      })
    async deleteUserReview(@CurrentUser() buyer: UserModel, @Params() params: UuidParam): Promise<GetUserReviewResponse> {
        return { userReview: await this.userReviewService.deleteUserReviewById(buyer, params) };
    }
}