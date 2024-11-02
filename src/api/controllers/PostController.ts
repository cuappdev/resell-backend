import { Body, CurrentUser, Delete, Get, JsonController, Params, Post } from 'routing-controllers';

import { UserModel } from '../../models/UserModel';
import { PostService } from '../../services/PostService';
import {
  CreatePostRequest,
  EditPostPriceRequest,
  EditPriceResponse,
  FilterPostsRequest,
  FilterPostsByPriceRequest,
  GetPostResponse,
  GetPostsResponse,
  GetSearchedPostsRequest,
  IsSavedPostResponse,
} from '../../types';
import { UuidParam } from '../validators/GenericRequests';
import { OpenAPI } from 'routing-controllers-openapi';

@JsonController('post/')
export class PostController {
  private postService: PostService;

  constructor(postService: PostService) {
    this.postService = postService;
  }

  @Get()
  @OpenAPI({
    summary: 'Get all posts',
    description: 'Gets all posts.',
    responses: {
      '200': {
        description: 'Posts returned successfully',
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
      }
    }
  })
  async getPosts(@CurrentUser() user: UserModel): Promise<GetPostsResponse> {
    return { posts: await this.postService.getAllPosts(user) };
  }

  @Get('id/:id/')
  @OpenAPI({
    summary: 'Get post by id',
    description: 'Gets a post by id.',
    responses: {
      '200': {
        description: 'Posts returned successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                post: {
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
    }
  })
  async getPostById(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetPostResponse> {
    return { post: await this.postService.getPostById(user, params) };
  }

  @Get('userId/:id/')
  @OpenAPI({
    summary: 'Get all posts by a userId',
    description: 'Gets all posts belonging to the userId.',
    responses: {
      '200': {
        description: 'Posts returned successfully',
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
      }
    }
  })
  async getPostsByUserId(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetPostsResponse> {
    return { posts: await this.postService.getPostsByUserId(user, params) };
  }

  @Post()
  @OpenAPI({
    summary: 'Create new post',
    description: 'Creates a post using request body.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['title', 'description', 'categories', 'price', 'userId'],
            properties: {
              title: {
                type: 'string',
                example: 'Bedside light'
              },
              description: {
                type: 'string',
                example: 'Barely used black bedside light with clip'
              },
              categories: {
                type: 'array',
                example: 'ELECTRONICS, HOUSEHOLD'
              },
              original_price: {
                type: 'number',
                example: 10.25
              },
              images_base64: {
                type: 'array',
                items: {
                  type: 'string',
                  example: 'https://img2.png'
                }
              },
              userId: {
                type: 'string',
                example: '0f97113e-7685-4338-9ee9-044cacde3554'
              }
            }
          }
        }
      }
    },
    responses: {
      '200': {
        description: 'Post created successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                post: {
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
      },
      '400': {
        description: 'Invalid request body'
      }
    }
  })
  async createPost(@Body({ options: { limit: process.env.UPLOAD_SIZE_LIMIT } }) createPostRequest: CreatePostRequest): Promise<GetPostResponse> {
    return { post: await this.postService.createPost(createPostRequest) };
  }

  @Delete('id/:id/')
  @OpenAPI({
    summary: 'Delete post',
    description: 'Deletes post with id of :id',
    responses: {
      '200': {
        description: 'Post deleted successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                post: {
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
      },
      '404': {
        description: 'Post not found'
      }
    }
  })
  async deletePostById(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetPostResponse> {
    return { post: await this.postService.deletePostById(user, params) };
  }

  @Post('search/')
  @OpenAPI({
    summary: 'Search posts',
    description: 'Gets posts by search using request body.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['keywords'],
            properties: {
              keywords: {
                type: 'string',
                example: 'light'
              }
            }
          }
        }
      }
    },
    responses: {
      '200': {
        description: 'Posts returned successfully',
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
      }
    }
  })
  async searchPosts(@CurrentUser() user: UserModel, @Body() getSearchedPostsRequest: GetSearchedPostsRequest): Promise<GetPostsResponse> {
    return { posts: await this.postService.searchPosts(user, getSearchedPostsRequest) };
  }

  @Post('filter/')
  @OpenAPI({
    summary: 'Filter posts',
    description: 'Gets posts by a category using request body.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['category'],
            properties: {
              category: {
                type: 'string',
                example: 'HOUSEHOLD'
              }
            }
          }
        }
      }
    },
    responses: {
      '200': {
        description: 'Posts returned successfully',
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
      }
    }
  })
  async filterPosts(@CurrentUser() user: UserModel, @Body() filterPostsRequest: FilterPostsRequest): Promise<GetPostsResponse> {
    return { posts: await this.postService.filterPosts(user, filterPostsRequest) };
  }

  @Post('filterByPrice/')
  @OpenAPI({
    summary: 'Filter posts by price',
    description: 'Gets posts by price range using request body.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['minPrice', 'maxPrice'],
            properties: {
              lowerbound: {
                type: 'number',
                example: 0
              },
              upperbound: {
                type: 'number',
                example: 50
              }
            }
          }
        }
      }
    },
    responses: {
      '200': {
        description: 'Posts returned successfully',
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
      }
    }
  })
  async filterPostsByPrice(@CurrentUser() user: UserModel, @Body() filterPostsByPriceRequest: FilterPostsByPriceRequest): Promise<GetPostsResponse> {
    return { posts: await this.postService.filterPostsByPrice(user, filterPostsByPriceRequest) };
  }

  @Get('archive/')
  @OpenAPI({
    summary: 'Get archived posts',
    description: 'Gets all archive posts',
    responses: {
      '200': {
        description: 'Posts returned successfully',
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
      }
    }
  })
  async getArchivedPosts(@CurrentUser() user: UserModel): Promise<GetPostsResponse> {
    return { posts: await this.postService.getArchivedPosts(user) };
  }

  @Get('archive/userId/:id/')
  @OpenAPI({
    summary: 'Get archived posts by user ID',
    description: 'Gets all archives posts from user with id :id',
    responses: {
      '200': {
        description: 'Posts returned successfully',
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
      }
    }
  })
  async getArchivedPostsByUserId(@Params() params: UuidParam): Promise<GetPostsResponse> {
    return { posts: await this.postService.getArchivedPostsByUserId(params) };
  }

  @Post('archive/postId/:id/')
  @OpenAPI({
    summary: 'Archive post',
    description: 'Gets and archives post with id :id for the logged in user',
    responses: {
      '200': {
        description: 'Post archived successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                post: {
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
      },
      '404': {
        description: 'Post not found'
      }
    }
  })
  async archivePost(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetPostResponse> {
    return { post: await this.postService.archivePost(user, params) };
  }

  @Post('archiveAll/userId/:id/')
  @OpenAPI({
    summary: 'Archive all posts by user ID',
    description: 'Archives all posts by a user with id :id',
    responses: {
      '200': {
        description: 'Posts archived successfully',
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
        description: 'Posts not found'
      }
    }
  })  
  async archiveAllPostsByUserId(@Params() params: UuidParam): Promise<GetPostsResponse> {
    return { posts: await this.postService.archiveAllPostsByUserId(params) };
  }

  @Get('save/')
  @OpenAPI({
    summary: 'Get post by user',
    description: 'Gets post with from a unique user. These ids are specific to our own backend.',
    responses: {
      '200': {
        description: 'Post returned successfully',
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
        description: 'Post not found'
      }
    }
  })
  async getSavedPostsByUserId(@CurrentUser() user: UserModel): Promise<GetPostsResponse> {
    return { posts: await this.postService.getSavedPostsByUserId(user) };
  }

  @Post('save/postId/:id/')
  @OpenAPI({
    summary: 'Save post',
    description: 'Gets and saves post with id :id for the logged in user',
    responses: {
      '200': {
        description: 'Post saved successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                post: {
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
      },
      '404': {
        description: 'Post not found'
      }
    }
  })
  async savePost(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetPostResponse> {
    return { post: await this.postService.savePost(user, params) };
  }

  @Post('unsave/postId/:id/')
  @OpenAPI({
    summary: 'Unsave post',
    description: 'Gets and unsaves post with id :id for the logged in user',
    responses: {
      '200': {
        description: 'Post unsaved successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                post: {
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
      },
      '404': {
        description: 'Post not found'
      }
    }
  })
  async unsavePost(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetPostResponse> {
    return { post: await this.postService.unsavePost(user, params) };
  }

  @Get('isSaved/postId/:id/')
  @OpenAPI({
    summary: 'Check if post is saved',
    description: 'Checks if post with id :id is saved for logged in user',
    responses: {
      '200': {
        description: 'Check completed successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                isSaved: {
                  type: 'boolean',
                  example: true
                }
              }
            }
          }
        }
      },
      '404': {
        description: 'Post not found'
      }
    }
  })
  async isSavedPost(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<IsSavedPostResponse> {
    return { isSaved: await this.postService.isSavedPost(user, params) };
  }

  @Post('edit/postId/:id/')
  @OpenAPI({
    summary: 'Edit post price',
    description: 'Edit post price with id :id',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['price'],
            properties: {
              price: {
                type: 'number',
                example: 15.99,
                description: 'New price for the post'
              }
            }
          }
        }
      }
    },
    responses: {
      '200': {
        description: 'Post price edited successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                new_price: {
                  type: 'string',
                  example: '15.99',
                  description: 'Updated price of the post'
                }
              }
            }
          }
        }
      },
      '404': {
        description: 'Post not found'
      }
    }
  })
  async editPrice(@Body() editPriceRequest: EditPostPriceRequest, @CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<EditPriceResponse> {
    return { new_price: await (await this.postService.editPostPrice(user, params, editPriceRequest)).altered_price };
  }

  @Get('similar/postId/:id/')
  @OpenAPI({
    summary: 'Get similar posts',
    description: 'Returns a list of posts that are similar to a post with id :id',
    responses: {
      '200': {
        description: 'Posts returned successfully',
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
        description: 'Post not found'
      }
    }
  })
  async similarPosts(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetPostsResponse> {
    return { posts: await this.postService.similarPosts(user, params) };
  }
}