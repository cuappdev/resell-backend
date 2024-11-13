import { Body, CurrentUser, JsonController, Get, Post, Delete, Params} from "routing-controllers";
import { UserModel } from "../../models/UserModel";
import { ReportService } from "../../services/ReportService";
import { ReportPostRequest, ReportProfileRequest, ReportMessageRequest } from "../../types/ApiRequests";
import { GetReportResponse, GetReportsResponse } from "../../types/ApiResponses";
import { ReportModel } from "../../models/ReportModel";
import { report } from "process";
import { UuidParam } from "../validators/GenericRequests";
import { OpenAPI } from "routing-controllers-openapi";

@JsonController("report/")
export class ReportController {
  private reportService: ReportService;

  constructor(reportService: ReportService) {
    this.reportService = reportService;
  }

  @Get("admin/all/")
  @OpenAPI({
    summary: "Get all reports",
    description: "Gets all reports.",
    responses: {
      "200": {
        description: "Reports returned successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                reports: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", example: "134841-42b4-4fdd-b074-jkfale" },
                      reporter: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "381527oejf-42b4-4fdd-b074-dfwbejko229" },
                          firstName: { type: "string", example: "Mateo" },
                          lastName: { type: "string", example: "Weiner" },
                          profilePicUrl: { type: "string", example: "https://img1.png" }
                        }
                      },
                      reportedContent: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "134841-42b4-4fdd-b074-jkfale" },
                          type: { type: "string", example: "POST" },
                          content: { type: "string", example: "Original content that was reported" }
                        }
                      },
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
                          }
                        }
                      },
                      message: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'string',
                            example: '134841-42b4-4fdd-b074-jkfale'
                          },
                          reports: {
                            type: 'array',
                            items: {
                              type: 'string',
                              format: 'uuid'
                            }
                          }
                        }
                      },
                      reason: { type: "string", example: "Inappropriate content" },
                      type: { type: "string", example: "POST", enum: ["POST", "PROFILE", "MESSAGE"] },
                      resolved: { type: "boolean", example: false },
                      created: { type: "string", format: "date-time", example: "2024-02-20T15:30:00Z" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "401": {
        description: "Unauthorized - User is not an admin"
      }
    }
  })
  async getAllReports(@CurrentUser() user: UserModel): Promise<GetReportsResponse> {
    return { reports: await this.reportService.getAllReports(user) };
  }

  @Get("admin/post/")
  @OpenAPI({
    summary: "Get all post reports",
    description: "Gets all post reports.",
    responses: {
      "200": {
        description: "Post reports returned successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                reports: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", example: "134841-42b4-4fdd-b074-jkfale" },
                      reporter: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "381527oejf-42b4-4fdd-b074-dfwbejko229" },
                          firstName: { type: "string", example: "Mateo" },
                          lastName: { type: "string", example: "Weiner" },
                          profilePicUrl: { type: "string", example: "https://img1.png" }
                        }
                      },
                      reportedContent: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "134841-42b4-4fdd-b074-jkfale" },
                          type: { type: "string", example: "POST" },
                          content: { type: "string", example: "Original content that was reported" }
                        }
                      },
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
                          }
                        }
                      },
                      message: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'string',
                            example: '134841-42b4-4fdd-b074-jkfale'
                          },
                          reports: {
                            type: 'array',
                            items: {
                              type: 'string',
                              format: 'uuid'
                            }
                          }
                        }
                      },
                      reason: { type: "string", example: "Inappropriate content" },
                      type: { type: "string", example: "POST", enum: ["POST", "PROFILE", "MESSAGE"] },
                      resolved: { type: "boolean", example: false },
                      created: { type: "string", format: "date-time", example: "2024-02-20T15:30:00Z" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "401": {
        description: "Unauthorized - User is not an admin"
      }
    }
  })
  async getAllPostReports(@CurrentUser() user: UserModel): Promise<GetReportsResponse> {
    return { reports: await this.reportService.getAllPostReports(user) };
  }

  @Get("admin/profile/")
  @OpenAPI({
    summary: "Get all profile reports",
    description: "Gets all profile reports.",
    responses: {
      "200": {
        description: "Profile reports returned successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                reports: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", example: "134841-42b4-4fdd-b074-jkfale" },
                      reporter: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "381527oejf-42b4-4fdd-b074-dfwbejko229" },
                          firstName: { type: "string", example: "Mateo" },
                          lastName: { type: "string", example: "Weiner" },
                          profilePicUrl: { type: "string", example: "https://img1.png" }
                        }
                      },
                      reportedContent: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "134841-42b4-4fdd-b074-jkfale" },
                          type: { type: "string", example: "POST" },
                          content: { type: "string", example: "Original content that was reported" }
                        }
                      },
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
                          }
                        }
                      },
                      message: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'string',
                            example: '134841-42b4-4fdd-b074-jkfale'
                          },
                          reports: {
                            type: 'array',
                            items: {
                              type: 'string',
                              format: 'uuid'
                            }
                          }
                        }
                      },
                      reason: { type: "string", example: "Inappropriate content" },
                      type: { type: "string", example: "POST", enum: ["POST", "PROFILE", "MESSAGE"] },
                      resolved: { type: "boolean", example: false },
                      created: { type: "string", format: "date-time", example: "2024-02-20T15:30:00Z" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "401": {
        description: "Unauthorized - User is not an admin"
      }
    }
  })
  async getAllProfileReports(@CurrentUser() user: UserModel): Promise<GetReportsResponse> {
    return { reports: await this.reportService.getAllProfileReports(user) };
  }

  @Get("admin/message/")
  @OpenAPI({
    summary: "Get all message reports",
    description: "Gets all message reports.",
    responses: {
      "200": {
        description: "Message reports returned successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                reports: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", example: "134841-42b4-4fdd-b074-jkfale" },
                      reporter: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "381527oejf-42b4-4fdd-b074-dfwbejko229" },
                          firstName: { type: "string", example: "Mateo" },
                          lastName: { type: "string", example: "Weiner" },
                          profilePicUrl: { type: "string", example: "https://img1.png" }
                        }
                      },
                      reportedContent: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "134841-42b4-4fdd-b074-jkfale" },
                          type: { type: "string", example: "POST" },
                          content: { type: "string", example: "Original content that was reported" }
                        }
                      },
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
                          }
                        }
                      },
                      message: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'string',
                            example: '134841-42b4-4fdd-b074-jkfale'
                          },
                          reports: {
                            type: 'array',
                            items: {
                              type: 'string',
                              format: 'uuid'
                            }
                          }
                        }
                      },
                      reason: { type: "string", example: "Inappropriate content" },
                      type: { type: "string", example: "POST", enum: ["POST", "PROFILE", "MESSAGE"] },
                      resolved: { type: "boolean", example: false },
                      created: { type: "string", format: "date-time", example: "2024-02-20T15:30:00Z" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "401": {
        description: "Unauthorized - User is not an admin"
      }
    }
  })
  async getAllMessageReports(@CurrentUser() user: UserModel): Promise<GetReportsResponse> {
    return { reports: await this.reportService.getAllMessageReports(user) };
  }

  @Get("id/:id/")
  @OpenAPI({
    summary: "Get report by id",
    description: "Gets report with id of :id.",
    responses: {
      "200": {
        description: "Report returned successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                report: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "134841-42b4-4fdd-b074-jkfale" },
                    reporter: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "381527oejf-42b4-4fdd-b074-dfwbejko229" },
                        firstName: { type: "string", example: "Mateo" },
                        lastName: { type: "string", example: "Weiner" },
                        profilePicUrl: { type: "string", example: "https://img1.png" }
                      }
                    },
                    reportedContent: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "134841-42b4-4fdd-b074-jkfale" },
                        type: { type: "string", example: "POST" },
                        content: { type: "string", example: "Original content that was reported" }
                      }
                    },
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
                        }
                      }
                    },
                    message: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          example: '134841-42b4-4fdd-b074-jkfale'
                        },
                        reports: {
                          type: 'array',
                          items: {
                            type: 'string',
                            format: 'uuid'
                          }
                        }
                      }
                    },
                    reason: { type: "string", example: "Inappropriate content" },
                    type: { type: "string", example: "POST", enum: ["POST", "PROFILE", "MESSAGE"] },
                    resolved: { type: "boolean", example: false },
                    created: { type: "string", format: "date-time", example: "2024-02-20T15:30:00Z" }
                  }
                }
              }
            }
          }
        }
      },
      "404": {
        description: "Report not found"
      }
    }
  })
  async getReportById(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetReportResponse> {
    return { report: await this.reportService.getReportById(user, params) };
  }

  @Get("reporter/id/:id/")
  @OpenAPI({
    summary: "Get reports by reporter",
    description: "Gets all reports made by a reporter with id :id.",
    responses: {
      "200": {
        description: "Reports returned successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                reports: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", example: "134841-42b4-4fdd-b074-jkfale" },
                      reporter: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "381527oejf-42b4-4fdd-b074-dfwbejko229" },
                          firstName: { type: "string", example: "Mateo" },
                          lastName: { type: "string", example: "Weiner" },
                          profilePicUrl: { type: "string", example: "https://img1.png" }
                        }
                      },
                      reportedContent: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "134841-42b4-4fdd-b074-jkfale" },
                          type: { type: "string", example: "POST" },
                          content: { type: "string", example: "Original content that was reported" }
                        }
                      },
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
                          }
                        }
                      },
                      message: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'string',
                            example: '134841-42b4-4fdd-b074-jkfale'
                          },
                          reports: {
                            type: 'array',
                            items: {
                              type: 'string',
                              format: 'uuid'
                            }
                          }
                        }
                      },
                      reason: { type: "string", example: "Inappropriate content" },
                      type: { type: "string", example: "POST", enum: ["POST", "PROFILE", "MESSAGE"] },
                      resolved: { type: "boolean", example: false },
                      created: { type: "string", format: "date-time", example: "2024-02-20T15:30:00Z" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "404": {
        description: "Reporter not found"
      }
    }
  })
  async getReportsByReporter(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetReportsResponse> {
    return { reports: await this.reportService.getReportsByReporter(user, params) };
  }

  @Post("post/")
  @OpenAPI({
    summary: "Report post",
    description: "Creates a new report for a post",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["profileId", "reason", "description"],
            properties: {
              reported: {
                type: "string",
                example: "381527oejf-42b4-4fdd-b074-dfwbejko229"
              },
              post: {
                type: "string",
                example: "94f8deaf-b67b-4046-b6bf-de89cd91cf83"
              },
              reason: {
                type: "string",
                example: "Suspicious activity"
              },
            }
          }
        }
      }
    },
    responses: {
      "200": {
        description: "Post reported successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                report: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "134841-42b4-4fdd-b074-jkfale" },
                    reporter: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "381527oejf-42b4-4fdd-b074-dfwbejko229" },
                        firstName: { type: "string", example: "Mateo" },
                        lastName: { type: "string", example: "Weiner" },
                        profilePicUrl: { type: "string", example: "https://img1.png" }
                      }
                    },
                    reportedContent: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "134841-42b4-4fdd-b074-jkfale" },
                        type: { type: "string", example: "POST" },
                        content: { type: "string", example: "Original content that was reported" }
                      }
                    },
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
                        }
                      }
                    },
                    message: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          example: '134841-42b4-4fdd-b074-jkfale'
                        },
                        reports: {
                          type: 'array',
                          items: {
                            type: 'string',
                            format: 'uuid'
                          }
                        }
                      }
                    },
                    reason: { type: "string", example: "Inappropriate content" },
                    type: { type: "string", example: "POST", enum: ["POST", "PROFILE", "MESSAGE"] },
                    resolved: { type: "boolean", example: false },
                    created: { type: "string", format: "date-time", example: "2024-02-20T15:30:00Z" }
                  }
                }
              }
            }
          }
        }
      },
      "404": {
        description: "Post not found"
      }
    }
  })
  async reportPost(@Body() reportPostRequest: ReportPostRequest, @CurrentUser() user: UserModel): Promise<ReportModel> {
    return this.reportService.reportPost(user, reportPostRequest);
  }

  @Post("profile/")
  @OpenAPI({
    summary: "Report profile",
    description: "Reports a profile.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["profileId", "reason", "description"],
            properties: {
              reported: {
                type: "string",
                example: "381527oejf-42b4-4fdd-b074-dfwbejko229"
              },
              reason: {
                type: "string",
                example: "Suspicious activity"
              },
            }
          }
        }
      }
    },
    responses: {
      "200": {
        description: "Profile reported successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                report: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "134841-42b4-4fdd-b074-jkfale" },
                    reporter: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "381527oejf-42b4-4fdd-b074-dfwbejko229" },
                        firstName: { type: "string", example: "Mateo" },
                        lastName: { type: "string", example: "Weiner" },
                        profilePicUrl: { type: "string", example: "https://img1.png" }
                      }
                    },
                    reportedContent: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "134841-42b4-4fdd-b074-jkfale" },
                        type: { type: "string", example: "POST" },
                        content: { type: "string", example: "Original content that was reported" }
                      }
                    },
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
                        }
                      }
                    },
                    message: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          example: '134841-42b4-4fdd-b074-jkfale'
                        },
                        reports: {
                          type: 'array',
                          items: {
                            type: 'string',
                            format: 'uuid'
                          }
                        }
                      }
                    },
                    reason: { type: "string", example: "Inappropriate content" },
                    type: { type: "string", example: "POST", enum: ["POST", "PROFILE", "MESSAGE"] },
                    resolved: { type: "boolean", example: false },
                    created: { type: "string", format: "date-time", example: "2024-02-20T15:30:00Z" }
                  }
                }
              }
            }
          }
        }
      },
      "404": {
        description: "Profile not found"
      }
    }
  })
  async reportProfile(@Body() reportProfileRequest: ReportProfileRequest, @CurrentUser() user: UserModel): Promise<ReportModel> {
    return this.reportService.reportProfile(user,reportProfileRequest);
  }

  @Post("message/")
  @OpenAPI({
    summary: "Report message",
    description: "Reports a message.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["profileId", "reason", "description"],
            properties: {
              reported: {
                type: "string",
                example: "381527oejf-42b4-4fdd-b074-dfwbejko229"
              },
              message: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: '134841-42b4-4fdd-b074-jkfale'
                  },
                  reports: {
                    type: 'array',
                    items: {
                      type: 'string',
                      format: 'uuid'
                    }
                  }
                }
              },
              reason: {
                type: "string",
                example: "Suspicious activity"
              },
            }
          }
        }
      }
    },
    responses: {
      "200": {
        description: "Message reported successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string" },
                type: { type: "string", enum: ["MESSAGE"] },
                reason: { type: "string" },
                description: { type: "string" },
                resolved: { type: "boolean" }
              }
            }
          }
        }
      },
      "404": {
        description: "Message not found"
      }
    }
  })
  async reportMessage(@Body() reportMessageRequest: ReportMessageRequest, @CurrentUser() user: UserModel): Promise<ReportModel> {
    return this.reportService.reportMessage(user, reportMessageRequest);
  }

  @Post("resolve/reportId/:id/")
  @OpenAPI({
    summary: "Resolve report",
    description: "Resolves a report with id :id. Only accessible by admins.",
    responses: {
      "200": {
        description: "Report resolved successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                report: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "134841-42b4-4fdd-b074-jkfale" },
                    reporter: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "381527oejf-42b4-4fdd-b074-dfwbejko229" },
                        firstName: { type: "string", example: "Mateo" },
                        lastName: { type: "string", example: "Weiner" },
                        profilePicUrl: { type: "string", example: "https://img1.png" }
                      }
                    },
                    reportedContent: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "134841-42b4-4fdd-b074-jkfale" },
                        type: { type: "string", example: "POST" },
                        content: { type: "string", example: "Original content that was reported" }
                      }
                    },
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
                        }
                      }
                    },
                    message: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          example: '134841-42b4-4fdd-b074-jkfale'
                        },
                        reports: {
                          type: 'array',
                          items: {
                            type: 'string',
                            format: 'uuid'
                          }
                        }
                      }
                    },
                    reason: { type: "string", example: "Inappropriate content" },
                    type: { type: "string", example: "POST", enum: ["POST", "PROFILE", "MESSAGE"] },
                    resolved: { type: "boolean", example: false },
                    created: { type: "string", format: "date-time", example: "2024-02-20T15:30:00Z" }
                  }
                }
              }
            }
          }
        }
      },
      "404": {
        description: "Report not found"
      },
      "401": {
        description: "Unauthorized - User is not an admin"
      }
    }
  })
  async resolveReport(@CurrentUser() user: UserModel,@Params() params: UuidParam): Promise<ReportModel> {
    return this.reportService.resolveReport(user, params);
  }

  @Delete("delete/:id/")
  @OpenAPI({
    summary: "Delete report",
    description: "Deletes report with id of :id.",
    responses: {
      "200": {
        description: "Report deleted successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                report: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "134841-42b4-4fdd-b074-jkfale" },
                    reporter: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "381527oejf-42b4-4fdd-b074-dfwbejko229" },
                        firstName: { type: "string", example: "Mateo" },
                        lastName: { type: "string", example: "Weiner" },
                        profilePicUrl: { type: "string", example: "https://img1.png" }
                      }
                    },
                    reportedContent: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "134841-42b4-4fdd-b074-jkfale" },
                        type: { type: "string", example: "POST" },
                        content: { type: "string", example: "Original content that was reported" }
                      }
                    },
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
                        }
                      }
                    },
                    message: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          example: '134841-42b4-4fdd-b074-jkfale'
                        },
                        reports: {
                          type: 'array',
                          items: {
                            type: 'string',
                            format: 'uuid'
                          }
                        }
                      }
                    },
                    reason: { type: "string", example: "Inappropriate content" },
                    type: { type: "string", example: "POST", enum: ["POST", "PROFILE", "MESSAGE"] },
                    resolved: { type: "boolean", example: false },
                    created: { type: "string", format: "date-time", example: "2024-02-20T15:30:00Z" }
                  }
                }
              }
            }
          }
        }
      },
      "404": {
        description: "Report not found"
      },
      "401": {
        description: "Unauthorized - User is not an admin"
      }
    }
  })
  async deleteReport(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<ReportModel> {
    return this.reportService.deleteReport(user, params);
  }
}
