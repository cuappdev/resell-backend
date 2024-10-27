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
                      type: { type: "string", example: "POST", enum: ["POST", "PROFILE", "MESSAGE"] },
                      reason: { type: "string", example: "Inappropriate content" },
                      description: { type: "string", example: "This post contains misleading information" },
                      resolved: { type: "boolean", example: false },
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
                      createdAt: { type: "string", format: "date-time", example: "2024-02-20T15:30:00Z" }
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
                      type: { type: "string", example: "POST" },
                      reason: { type: "string", example: "Inappropriate content" },
                      description: { type: "string", example: "This post contains misleading information" },
                      resolved: { type: "boolean", example: false },
                      reporter: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "381527oejf-42b4-4fdd-b074-dfwbejko229" },
                          firstName: { type: "string", example: "Mateo" },
                          lastName: { type: "string", example: "Weiner" },
                          profilePicUrl: { type: "string", example: "https://img1.png" }
                        }
                      },
                      reportedPost: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "134841-42b4-4fdd-b074-jkfale" },
                          title: { type: "string", example: "Bedside light" },
                          description: { type: "string", example: "Barely used black bedside light with clip" }
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
                      type: { type: "string", example: "PROFILE" },
                      reason: { type: "string", example: "Suspicious activity" },
                      description: { type: "string", example: "This user is posting spam" },
                      resolved: { type: "boolean", example: false },
                      reporter: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "381527oejf-42b4-4fdd-b074-dfwbejko229" },
                          firstName: { type: "string", example: "Mateo" },
                          lastName: { type: "string", example: "Weiner" },
                          profilePicUrl: { type: "string", example: "https://img1.png" }
                        }
                      },
                      reportedProfile: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "134841-42b4-4fdd-b074-jkfale" },
                          firstName: { type: "string", example: "John" },
                          lastName: { type: "string", example: "Doe" },
                          email: { type: "string", example: "jd123@cornell.edu" }
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
                      type: { type: "string", example: "MESSAGE" },
                      reason: { type: "string", example: "Harassment" },
                      description: { type: "string", example: "User is sending threatening messages" },
                      resolved: { type: "boolean", example: false },
                      reporter: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "381527oejf-42b4-4fdd-b074-dfwbejko229" },
                          firstName: { type: "string", example: "Mateo" },
                          lastName: { type: "string", example: "Weiner" },
                          profilePicUrl: { type: "string", example: "https://img1.png" }
                        }
                      },
                      reportedMessage: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "134841-42b4-4fdd-b074-jkfale" },
                          content: { type: "string", example: "Message content" },
                          sender: {
                            type: "object",
                            properties: {
                              id: { type: "string" },
                              firstName: { type: "string" },
                              lastName: { type: "string" }
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
                    type: { type: "string", example: "POST" },
                    reason: { type: "string", example: "Inappropriate content" },
                    description: { type: "string", example: "This post contains misleading information" },
                    resolved: { type: "boolean", example: false },
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
                        id: { type: "string" },
                        type: { type: "string" },
                        content: { type: "string" }
                      }
                    }
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
                      type: { type: "string", example: "POST" },
                      reason: { type: "string", example: "Inappropriate content" },
                      description: { type: "string", example: "This post contains misleading information" },
                      resolved: { type: "boolean", example: false },
                      reportedContent: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          type: { type: "string" },
                          content: { type: "string" }
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
            required: ["postId", "reason", "description"],
            properties: {
              postId: {
                type: "string",
                example: "134841-42b4-4fdd-b074-jkfale"
              },
              reason: {
                type: "string",
                example: "Inappropriate content"
              },
              description: {
                type: "string",
                example: "This post contains misleading information"
              }
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
                    id: { type: "string" },
                    type: { type: "string", enum: ["POST"] },
                    reason: { type: "string" },
                    description: { type: "string" },
                    resolved: { type: "boolean" },
                    reporter: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        firstName: { type: "string" },
                        lastName: { type: "string" },
                        profilePicUrl: { type: "string" }
                      }
                    },
                    reportedContent: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        type: { type: "string" },
                        content: { type: "string" }
                      }
                    }
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
              profileId: {
                type: "string",
                example: "381527oejf-42b4-4fdd-b074-dfwbejko229"
              },
              reason: {
                type: "string",
                example: "Suspicious activity"
              },
              description: {
                type: "string",
                example: "This user is posting spam"
              }
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
                id: { type: "string" },
                type: { type: "string", enum: ["PROFILE"] },
                reason: { type: "string" },
                description: { type: "string" },
                resolved: { type: "boolean" }
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
            required: ["messageId", "reason", "description"],
            properties: {
              messageId: {
                type: "string",
                example: "134841-42b4-4fdd-b074-jkfale"
              },
              reason: {
                type: "string",
                example: "Harassment"
              },
              description: {
                type: "string",
                example: "User is sending threatening messages"
              }
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
                    resolved: { type: "boolean", example: true },
                    resolvedAt: { type: "string", format: "date-time", example: "2024-02-20T15:30:00Z" },
                    resolvedBy: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        firstName: { type: "string" },
                        lastName: { type: "string" }
                      }
                    }
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
                id: { type: "string", example: "134841-42b4-4fdd-b074-jkfale" },
                type: { type: "string", example: "POST" },
                reason: { type: "string", example: "Inappropriate content" },
                description: { type: "string", example: "This post contains misleading information" }
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
