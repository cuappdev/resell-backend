import { Body, CurrentUser, Delete, Get, HeaderParam, JsonController, Params, Post } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
// import { JSONSchema } from 'class-validator-jsonschema';
import { IsString, IsEmail, IsOptional } from 'class-validator';

import { UserModel } from '../../models/UserModel';
import { AuthService } from '../../services/AuthService';
import {
  APIUserSession,
  CreateUserRequest,
  GetSessionReponse,
  GetSessionsReponse,
  GetUserResponse,
  LogoutResponse,
} from '../../types';
import { LoginRequest } from '../validators/AuthControllerRequests';
import { UuidParam } from '../validators/GenericRequests';

@JsonController('auth/')
export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  @Get()
  @OpenAPI({
    summary: 'Get current user',
    description: 'Returns the profile information of the currently authenticated user',
    responses: {
      '200': {
        description: 'Current user profile retrieved successfully',
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
        description: 'Not authenticated'
      }
    }
  })
  async currentUser(@CurrentUser() user: UserModel): Promise<GetUserResponse> {
    return { user: user.getUserProfile() };
  }

  @Post()
  @OpenAPI({
    summary: 'Create new user',
    description: 'Creates a new user account with Google authentication',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['username', 'netid', 'givenName', 'familyName', 'email', 'googleId'],
            properties: {
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
              photoUrl: { 
                type: 'string',
                example: 'https://img1.png'
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
                example: 'hi im mateo'
              }
            }
          }
        }
      }
    },
    responses: {
      '200': {
        description: 'User created successfully',
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
                      format: 'uuid'
                    },
                    username: { 
                      type: 'string'
                    },
                    netid: { 
                      type: 'string'
                    },
                    givenName: { 
                      type: 'string'
                    },
                    familyName: { 
                      type: 'string'
                    },
                    admin: { 
                      type: 'boolean'
                    },
                    photoUrl: { 
                      type: 'string',
                      nullable: true
                    },
                    email: { 
                      type: 'string',
                      format: 'email'
                    },
                    googleId: { 
                      type: 'string'
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
      },
      '409': {
        description: 'User with same username/netid/email/googleId already exists'
      }
    }
  })
  async createUser(@Body() createUserRequest: CreateUserRequest): Promise<GetUserResponse> {
    return { user: await this.authService.createUser(createUserRequest) };
  }

  @Post('login/')
  @OpenAPI({
    summary: 'User login',
    description: 'Logs in the user. Returns an access_token to be used in every following request.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['idToken', 'accessToken', 'refreshToken', 'deviceToken', 'type', 'user'],
            properties: {
              accessToken: { 
                type: 'string',
                example: 'ya29.A0ARrd0SNWs4K5AVprDeXhxarA-51'
              },
              idToken: { 
                type: 'string',
                example: '9wjHeKkuo4Ty9MjxNcod2qPW8WTb1oQ',
                description: 'Token from Google login'
              },
              refreshToken: { 
                type: 'string',
                example: '1//0dlwdsmRT7REaOv-RNh8IQrh8K004fq4'
              },
              deviceToken: { 
                type: 'string',
                example: 'somethingsomethingsomething'
              },
              type: { 
                type: 'string',
                example: 'success'
              },
              user: {
                type: 'object',
                properties: {
                  email: { 
                    type: 'string',
                    format: 'email',
                    example: 'hw595@cornell.edu'
                  },
                  familyName: { 
                    type: 'string',
                    example: 'Wang'
                  },
                  givenName: { 
                    type: 'string',
                    example: 'Haichen'
                  },
                  id: { 
                    type: 'string',
                    example: '111668722491153685331'
                  },
                  name: { 
                    type: 'string',
                    example: 'Haichen Wang'
                  },
                  photoUrl: { 
                    type: 'string',
                    example: 'https://lh3.googleusercontent.com/a-/AO0YRw=s96-c'
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
        description: 'Login successful',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                userId: { 
                  type: 'string',
                  description: 'User ID'
                },
                accessToken: { 
                  type: 'string',
                  description: 'Access token for authentication'
                },
                active: { 
                  type: 'boolean',
                  example: true
                },
                expiresAt: { 
                  type: 'number',
                  example: 1652880036770,
                  description: 'Token expiration timestamp'
                },
                refreshToken: { 
                  type: 'string',
                  description: 'Token for refreshing access'
                }
              }
            }
          }
        }
      },
      '401': {
        description: 'Invalid credentials or non-Cornell email'
      },
      '403': {
        description: 'User is soft deleted or invalid credentials'
      }
    }
  })
  async login(@Body() loginRequest: LoginRequest): Promise<APIUserSession> {
    return (await this.authService.loginUser(loginRequest)).serializeToken();
  }

  @Post('logout/')
  @OpenAPI({
    summary: 'User logout',
    description: 'Logs out the user. Returns if the log out was successful or not.',
    parameters: [{
      in: 'header',
      name: 'authorization',
      required: true,
      schema: {
        type: 'string'
      },
      description: 'Session token',
      example: '<session token>'
    }],
    responses: {
      '200': {
        description: 'Logout successful',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                logoutSuccess: {
                  type: 'boolean',
                  example: true
                }
              }
            }
          }
        }
      },
      '401': {
        description: 'Invalid session token'
      }
    }
  })
  async logout(@HeaderParam("authorization") accessToken: string): Promise<LogoutResponse> {
    return { logoutSuccess: await this.authService.deleteSessionByAccessToken(accessToken) };
  }

  @Delete('id/:id/')
  @OpenAPI({
    summary: 'Delete user',
    description: 'Deletes a user account',
    parameters: [{
      in: 'path',
      name: 'id',
      required: true,
      schema: { type: 'string', format: 'uuid' }
    }],
    responses: {
      '200': { 
        description: 'User deleted successfully',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/GetUserResponse' }
          }
        }
      },
      '404': { description: 'User not found' },
      '401': { description: 'Unauthorized' }
    }
  })
  async deleteUserById(@Params() params: UuidParam): Promise<GetUserResponse> {
    return { user: await this.authService.deleteUserById(params) };
  }

  @Get('sessions/:id/')
  @OpenAPI({
    summary: 'Get user sessions',
    description: 'Gets all sessions associated to given userId',
    parameters: [{
      in: 'path',
      name: 'id',
      required: true,
      schema: { type: 'string', format: 'uuid' }
    }],
    responses: {
      '200': {
        description: 'User sessions returned successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                sessions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      userId: { type: 'string', example: '381527oejf-42b4-4fdd-b074-dfwbejko229' },
                      accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                      active: { type: 'boolean', example: true },
                      expiresAt: { type: 'number', example: 1652880036770 },
                      refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '404': { description: 'User not found' },
      '401': { description: 'Unauthorized' }
    }
  })
  async getSessionsByUserId(@Params() params: UuidParam): Promise<GetSessionsReponse> {
    return { sessions: await this.authService.getSessionsByUserId(params) };
  }

  @Get('refresh/')
  @OpenAPI({
    summary: 'Refresh token',
    description: 'Refreshes the current user\'s session token',
    parameters: [{
      in: 'header',
      name: 'authorization',
      required: true,
      schema: { type: 'string' },
      description: 'Refresh token to use for generating new access token'
    }],
    responses: {
      '200': {
        description: 'Token refreshed successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                session: {
                  type: 'object',
                  properties: {
                    userId: { type: 'string', example: '381527oejf-42b4-4fdd-b074-dfwbejko229' },
                    accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    active: { type: 'boolean', example: true },
                    expiresAt: { type: 'number', example: 1652880036770 },
                    refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
                  }
                }
              }
            }
          }
        }
      },
      '401': { description: 'Invalid refresh token' }
    }
  })
  async refreshToken(@HeaderParam("authorization") refreshToken: string): Promise<GetSessionReponse> {
    return { session: await this.authService.updateSession(refreshToken) };
  }
}