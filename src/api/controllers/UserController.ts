import { Body, CurrentUser, Get, JsonController, Param, Params, Post, Delete} from 'routing-controllers';

import { UserModel } from '../../models/UserModel';
import { UserService } from '../../services/UserService';
import { BlockUserRequest, UnblockUserRequest, EditProfileRequest, GetUserByEmailRequest, GetUserResponse, GetUsersResponse, SaveTokenRequest, SetAdminByEmailRequest } from '../../types';
import { UuidParam } from '../validators/GenericRequests';
import { OpenAPI } from 'routing-controllers-openapi';

@JsonController('user/')
export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  @Get()
  @OpenAPI({
    summary: 'Get all users',
    description: 'Gets all users.',
    responses: {
      '200': {
        description: 'Users returned successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                users: {
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
                }
              }
            }
          }
        }
      }
    }
  })
  async getUsers(@CurrentUser() user: UserModel): Promise<GetUsersResponse> {
    const users = await this.userService.getAllUsers(user);
    return { users: users.map((user) => user.getUserProfile()) };
  }

  @Post()
  @OpenAPI({
    summary: 'Edit user profile',
    description: 'Updates user profile information.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
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
    },
    responses: {
      '200': {
        description: 'User updated successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    username: { 
                      type: 'string',
                      example: 'haichen_wang'
                    },
                    netid: { 
                      type: 'string',
                      example: 'hw595'
                    },
                    givenName: { 
                      type: 'string',
                      example: 'Haichen'
                    },
                    familyName: { 
                      type: 'string',
                      example: 'Wang'
                    },
                    admin: { 
                      type: 'boolean',
                      example: false
                    },
                    photoUrl: { 
                      type: 'string',
                      example: 'https://lh3.googleusercontent.com/a-/AOh14GjADBhtoQsJArieGsAqiZwVTHJMA6AqqbqUzT0YRw=s96-c'
                    },
                    venmoHandle: { 
                      type: 'string',
                      nullable: true
                    },
                    email: { 
                      type: 'string',
                      example: 'hw595@cornell.edu'
                    },
                    googleId: { 
                      type: 'string',
                      example: '111668722491153685331'
                    },
                    bio: { 
                      type: 'string',
                      example: ''
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
  async editProfile(@Body({ options: { limit: process.env.UPLOAD_SIZE_LIMIT } }) editProfileRequest: EditProfileRequest, @CurrentUser() user: UserModel): Promise<GetUserResponse> {
    return { user: await this.userService.updateUser(editProfileRequest, user) };
  }

  @Get('id/:id/')
  @OpenAPI({
    summary: 'Get user by id',
    description: 'Gets user with id of :id. These ids are specific to our own backend.',
    responses: {
      '200': {
        description: 'User returned successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
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
      },
      '404': {
        description: 'User not found'
      }
    }
  })
  async getUserById(@Params() params: UuidParam): Promise<GetUserResponse> {
    return { user: await this.userService.getUserById(params) };
  }

  @Get('googleId/:id/')
  @OpenAPI({
    summary: 'Get user by Google id',
    description: 'Gets user with google id of :id.',
    responses: {
      '200': {
        description: 'User returned successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
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
      },
      '404': {
        description: 'User not found'
      }
    }
  })
  async getUserByGoogleId(@Param("id") id: string): Promise<GetUserResponse> {
    return { user: await this.userService.getUserByGoogleId(id) };
  }

  @Get('postId/:id/')
  @OpenAPI({
    summary: 'Get user by post id',
    description: 'Gets user who created the post with id of :id.',
    responses: {
      '200': {
        description: 'User returned successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
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
      },
      '404': {
        description: 'User not found'
      }
    }
  })
  async getUserByPostId(@Params() params: UuidParam): Promise<GetUserResponse> {
    return { user: await this.userService.getUserByPostId(params) };
  }

  @Post('email/')
  @OpenAPI({
    summary: 'Get user by email',
    description: 'Gets user by email in request body.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['email'],
            properties: {
              email: {
                type: 'string',
                example: 'maw346@cornell.edu'
              }
            }
          }
        }
      }
    },
    responses: {
      '200': {
        description: 'User returned successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
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
      },
      '404': {
        description: 'User not found'
      }
    }
  })
  async getUserByEmail(@Body() getUserByEmailRequest: GetUserByEmailRequest): Promise<GetUserResponse> {
    return { user: await this.userService.getUserByEmail(getUserByEmailRequest.email) };
  }

  @Post('admin/')
  @OpenAPI({
    summary: 'Set admin status',
    description: 'Sets admin status for a user.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['email', 'admin'],
            properties: {
              email: {
                type: 'string',
                format: 'email',
                example: 'maw346@cornell.edu'
              },
              admin: {
                type: 'boolean',
                example: true
              }
            }
          }
        }
      }
    },
    responses: {
      '200': {
        description: 'Admin status updated successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
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
      },
      '401': {
        description: 'Unauthorized - Requires super admin privileges'
      },
      '404': {
        description: 'User not found'
      }
    }
  })
  async setAdmin(@Body() setAdminByEmailRequest: SetAdminByEmailRequest, @CurrentUser() superAdmin: UserModel): Promise<GetUserResponse> {
    return { user: await this.userService.setAdmin(superAdmin, setAdminByEmailRequest) };
  }

  @Post('block/')
  @OpenAPI({
    summary: 'Block user',
    description: 'Block user by userId in request body.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['blocked'],
            properties: {
              blocked: {
                type: 'string',
                example: '221093-249ej-hkfae3901-2q9ffi'
              }
            }
          }
        }
      }
    },
    responses: {
      '200': {
        description: 'User blocked successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
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
  })
  async blockUser(@Body() blockUserRequest: BlockUserRequest, @CurrentUser() user: UserModel): Promise<GetUserResponse> {
    return { user: await this.userService.blockUser(user, blockUserRequest) }
  }

  @Post('unblock/')
  @OpenAPI({
    summary: 'Unblock user',
    description: 'Unblock user by userId in request body.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['unblocked'],
            properties: {
              unblocked: {
                type: 'string',
                example: '221093-249ej-hkfae3901-2q9ffi'
              }
            }
          }
        }
      }
    },
    responses: {
      '200': {
        description: 'User unblocked successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
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
  })
  async unblockUser(@Body() unblockUserRequest: UnblockUserRequest, @CurrentUser() user: UserModel): Promise<GetUserResponse> {
    return { user: await this.userService.unblockUser(user, unblockUserRequest) }
  }

  @Get('blocked/id/:id/')
  @OpenAPI({
    summary: 'Get blocked users',
    description: 'Gets all the users a user with id of :id is blocking. These ids are specific to our own backend.',
    responses: {
      '200': {
        description: 'Blocked users returned successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                users: {
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
  async getBlockedUsersById(@Params() params: UuidParam): Promise<GetUsersResponse> {
    return { users: await this.userService.getBlockedUsersById(params) };
  }

  @Delete('id/:id/')
  @OpenAPI({
    summary: 'Delete user',
    description: 'Permanently deletes a user by its id.',
    responses: {
      '200': {
        description: 'User deleted successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
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
      },
      '404': {
        description: 'User not found'
      }
    }
  })
  async deleteUser(@Params() params: UuidParam, @CurrentUser() user: UserModel): Promise<GetUserResponse> {
    return { user: await this.userService.deleteUser(user, params) };
  }

  @Post('softDelete/id/:id/')
  @OpenAPI({
    summary: 'Soft delete user',
    description: 'Soft deletes a user with id of :id.',
    responses: {
      '200': {
        description: 'User soft deleted successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
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
      },
      '404': {
        description: 'User not found'
      }
    }
  })
  async softDeleteUser(@Params() params: UuidParam): Promise<GetUserResponse> {
    return { user: await this.userService.softDeleteUser(params) };
  }
}