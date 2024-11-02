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
                      matches: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { 
                              type: 'string',
                              example: '134841-42b4-4fdd-b074-jkfale'
                            },
                            title: { 
                              type: 'string',
                              example: 'Bedside light'
                            },
                            description: { 
                              type: 'string',
                              example: 'Barely used black bedside light with clip'
                            },
                            categories: { 
                              type: 'string',
                              example: 'ELECTRONICS, HOUSEHOLD'
                            },
                            original_price: { 
                              type: 'number',
                              example: 10.50
                            },
                            altered_price: { 
                              type: 'number',
                              example: 10.50
                            },
                            images: {
                              type: 'array',
                              items: {
                                type: 'string',
                                example: 'https://img2.png'
                              }
                            },
                            created: { 
                              type: 'number',
                              example: 1320538301
                            },
                            location: { 
                              type: 'string',
                              example: ''
                            },
                            archive: { 
                              type: 'boolean',
                              example: false
                            },
                            user: {
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
                    },
                    user: {
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
                    matches: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { 
                            type: 'string',
                            example: '134841-42b4-4fdd-b074-jkfale'
                          },
                          title: { 
                            type: 'string',
                            example: 'Bedside light'
                          },
                          description: { 
                            type: 'string',
                            example: 'Barely used black bedside light with clip'
                          },
                          categories: { 
                            type: 'string',
                            example: 'ELECTRONICS, HOUSEHOLD'
                          },
                          original_price: { 
                            type: 'number',
                            example: 10.50
                          },
                          altered_price: { 
                            type: 'number',
                            example: 10.50
                          },
                          images: {
                            type: 'array',
                            items: {
                              type: 'string',
                              example: 'https://img2.png'
                            }
                          },
                          created: { 
                            type: 'number',
                            example: 1320538301
                          },
                          location: { 
                            type: 'string',
                            example: ''
                          },
                          archive: { 
                            type: 'boolean',
                            example: false
                          },
                          user: {
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
                      matches: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { 
                              type: 'string',
                              example: '134841-42b4-4fdd-b074-jkfale'
                            },
                            title: { 
                              type: 'string',
                              example: 'Bedside light'
                            },
                            description: { 
                              type: 'string',
                              example: 'Barely used black bedside light with clip'
                            },
                            categories: { 
                              type: 'string',
                              example: 'ELECTRONICS, HOUSEHOLD'
                            },
                            original_price: { 
                              type: 'number',
                              example: 10.50
                            },
                            altered_price: { 
                              type: 'number',
                              example: 10.50
                            },
                            images: {
                              type: 'array',
                              items: {
                                type: 'string',
                                example: 'https://img2.png'
                              }
                            },
                            created: { 
                              type: 'number',
                              example: 1320538301
                            },
                            location: { 
                              type: 'string',
                              example: ''
                            },
                            archive: { 
                              type: 'boolean',
                              example: false
                            },
                            user: {
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
                    matches: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { 
                            type: 'string',
                            example: '134841-42b4-4fdd-b074-jkfale'
                          },
                          title: { 
                            type: 'string',
                            example: 'Bedside light'
                          },
                          description: { 
                            type: 'string',
                            example: 'Barely used black bedside light with clip'
                          },
                          categories: { 
                            type: 'string',
                            example: 'ELECTRONICS, HOUSEHOLD'
                          },
                          original_price: { 
                            type: 'number',
                            example: 10.50
                          },
                          altered_price: { 
                            type: 'number',
                            example: 10.50
                          },
                          images: {
                            type: 'array',
                            items: {
                              type: 'string',
                              example: 'https://img2.png'
                            }
                          },
                          created: { 
                            type: 'number',
                            example: 1320538301
                          },
                          location: { 
                            type: 'string',
                            example: ''
                          },
                          archive: { 
                            type: 'boolean',
                            example: false
                          },
                          user: {
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
                    },
                    user: {
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
                    matches: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { 
                            type: 'string',
                            example: '134841-42b4-4fdd-b074-jkfale'
                          },
                          title: { 
                            type: 'string',
                            example: 'Bedside light'
                          },
                          description: { 
                            type: 'string',
                            example: 'Barely used black bedside light with clip'
                          },
                          categories: { 
                            type: 'string',
                            example: 'ELECTRONICS, HOUSEHOLD'
                          },
                          original_price: { 
                            type: 'number',
                            example: 10.50
                          },
                          altered_price: { 
                            type: 'number',
                            example: 10.50
                          },
                          images: {
                            type: 'array',
                            items: {
                              type: 'string',
                              example: 'https://img2.png'
                            }
                          },
                          created: { 
                            type: 'number',
                            example: 1320538301
                          },
                          location: { 
                            type: 'string',
                            example: ''
                          },
                          archive: { 
                            type: 'boolean',
                            example: false
                          },
                          user: {
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
                    matches: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { 
                            type: 'string',
                            example: '134841-42b4-4fdd-b074-jkfale'
                          },
                          title: { 
                            type: 'string',
                            example: 'Bedside light'
                          },
                          description: { 
                            type: 'string',
                            example: 'Barely used black bedside light with clip'
                          },
                          categories: { 
                            type: 'string',
                            example: 'ELECTRONICS, HOUSEHOLD'
                          },
                          original_price: { 
                            type: 'number',
                            example: 10.50
                          },
                          altered_price: { 
                            type: 'number',
                            example: 10.50
                          },
                          images: {
                            type: 'array',
                            items: {
                              type: 'string',
                              example: 'https://img2.png'
                            }
                          },
                          created: { 
                            type: 'number',
                            example: 1320538301
                          },
                          location: { 
                            type: 'string',
                            example: ''
                          },
                          archive: { 
                            type: 'boolean',
                            example: false
                          },
                          user: {
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
                      matches: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { 
                              type: 'string',
                              example: '134841-42b4-4fdd-b074-jkfale'
                            },
                            title: { 
                              type: 'string',
                              example: 'Bedside light'
                            },
                            description: { 
                              type: 'string',
                              example: 'Barely used black bedside light with clip'
                            },
                            categories: { 
                              type: 'string',
                              example: 'ELECTRONICS, HOUSEHOLD'
                            },
                            original_price: { 
                              type: 'number',
                              example: 10.50
                            },
                            altered_price: { 
                              type: 'number',
                              example: 10.50
                            },
                            images: {
                              type: 'array',
                              items: {
                                type: 'string',
                                example: 'https://img2.png'
                              }
                            },
                            created: { 
                              type: 'number',
                              example: 1320538301
                            },
                            location: { 
                              type: 'string',
                              example: ''
                            },
                            archive: { 
                              type: 'boolean',
                              example: false
                            },
                            user: {
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
                posts: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { 
                        type: 'string',
                        example: '134841-42b4-4fdd-b074-jkfale'
                      },
                      title: { 
                        type: 'string',
                        example: 'Bedside light'
                      },
                      description: { 
                        type: 'string',
                        example: 'Barely used black bedside light with clip'
                      },
                      categories: { 
                        type: 'string',
                        example: 'ELECTRONICS, HOUSEHOLD'
                      },
                      original_price: { 
                        type: 'number',
                        example: 10.50
                      },
                      altered_price: { 
                        type: 'number',
                        example: 10.50
                      },
                      images: {
                        type: 'array',
                        items: {
                          type: 'string',
                          example: 'https://img2.png'
                        }
                      },
                      created: { 
                        type: 'number',
                        example: 1320538301
                      },
                      location: { 
                        type: 'string',
                        example: ''
                      },
                      archive: { 
                        type: 'boolean',
                        example: false
                      },
                      user: {
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
                      savers: {
                        type: 'array',
                        items: {
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
                      },
                      matched: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { 
                              type: 'string',
                              example: '381527oejf-42b4-4fdd-b074-dfwbejko229'
                            },
                            title: { 
                              type: 'string',
                              example: 'Bedside light'
                            },
                            description: { 
                              type: 'string',
                              example: 'bedside light'
                            },
                            user: {
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
                            matches: { 
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  id: { 
                                    type: 'string',
                                    example: '134841-42b4-4fdd-b074-jkfale'
                                  },
                                  title: { 
                                    type: 'string',
                                    example: 'Bedside light'
                                  },
                                  description: { 
                                    type: 'string',
                                    example: 'Barely used black bedside light with clip'
                                  },
                                  categories: { 
                                    type: 'string',
                                    example: 'ELECTRONICS, HOUSEHOLD'
                                  },
                                  original_price: { 
                                    type: 'number',
                                    example: 10.50
                                  },
                                  altered_price: { 
                                    type: 'number',
                                    example: 10.50
                                  },
                                  images: {
                                    type: 'array',
                                    items: {
                                      type: 'string',
                                      example: 'https://img2.png'
                                    }
                                  },
                                  created: { 
                                    type: 'number',
                                    example: 1320538301
                                  },
                                  location: { 
                                    type: 'string',
                                    example: ''
                                  },
                                  archive: { 
                                    type: 'boolean',
                                    example: false
                                  },
                                  user: {
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