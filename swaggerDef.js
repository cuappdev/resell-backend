module.exports = {
  openapi: "3.0.0",
  info: {
    title: "Resell API",
    version: "1.0.0",
    description: "API for the resell application",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
  ],
  paths: {
    "/report/admin/all/": {
      get: {
        tags: ["Report"],
        summary: "Get all reports",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of all reports",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reports: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Report" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/report/admin/post/": {
      get: {
        tags: ["Report"],
        summary: "Get all post reports",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of all post reports",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reports: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Report" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/report/admin/profile/": {
      get: {
        tags: ["Report"],
        summary: "Get all profile reports",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of all profile reports",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reports: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Report" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/report/admin/message/": {
      get: {
        tags: ["Report"],
        summary: "Get all message reports",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of all message reports",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reports: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Report" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/report/id/{id}/": {
      get: {
        tags: ["Report"],
        summary: "Get report by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: {
            description: "Report details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    report: { $ref: "#/components/schemas/Report" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/report/reporter/id/{id}/": {
      get: {
        tags: ["Report"],
        summary: "Get reports by reporter ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "List of reports by reporter",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reports: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Report" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/report/post/": {
      post: {
        tags: ["Report"],
        summary: "Report a post",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ReportPostRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Report created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Report" },
              },
            },
          },
        },
      },
    },
    "/report/profile/": {
      post: {
        tags: ["Report"],
        summary: "Report a profile",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ReportProfileRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Report created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Report" },
              },
            },
          },
        },
      },
    },
    "/report/message/": {
      post: {
        tags: ["Report"],
        summary: "Report a message",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ReportMessageRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Report created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Report" },
              },
            },
          },
        },
      },
    },
    "/report/resolve/reportId/{id}/": {
      post: {
        tags: ["Report"],
        summary: "Resolve a report",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: {
            description: "Report resolved",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Report" },
              },
            },
          },
        },
      },
    },
    "/report/delete/{id}/": {
      delete: {
        tags: ["Report"],
        summary: "Delete a report",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: {
            description: "Report deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Report" },
              },
            },
          },
        },
      },
    },
    "/notif/recent": {
      get: {
        tags: ["Notification"],
        summary: "Get recent notifications for the current user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of recent notifications",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    notifications: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Notification" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/notif": {
      post: {
        tags: ["Notification"],
        summary: "Send notification",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/FindTokensRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Notification sent successfully",
          },
        },
      },
    },
    "/notif/request-match": {
      post: {
        tags: ["Notification"],
        summary: "Send request match notification",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RequestMatchNotificationRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Request match notification sent successfully",
          },
        },
      },
    },
    "/notif/discount": {
      post: {
        tags: ["Notification"],
        summary: "Send a discount notification",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  listingId: { type: "string" },
                  oldPrice: { type: "number" },
                  newPrice: { type: "number" },
                  sellerId: { type: "string" },
                },
                required: ["listingId", "oldPrice", "newPrice", "sellerId"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Discount notification sent successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/user/softDelete/id/{id}": {
      post: {
        tags: ["User"],
        summary: "Soft delete a user",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "User soft deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth": {
      post: {
        tags: ["Auth"],
        summary: "Authorize user",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/FcmTokenRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "User authorized successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
        },
      },
    },
    "/feedback": {
      get: {
        tags: ["Feedback"],
        summary: "Get all feedback",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of all feedback",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    feedbacks: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Feedback" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Feedback"],
        summary: "Create feedback",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateFeedbackRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Feedback created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    feedback: { $ref: "#/components/schemas/Feedback" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/feedback/id/{id}": {
      get: {
        tags: ["Feedback"],
        summary: "Get feedback by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: {
            description: "Feedback details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    feedback: { $ref: "#/components/schemas/Feedback" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Feedback"],
        summary: "Delete feedback by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: {
            description: "Feedback deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    feedback: { $ref: "#/components/schemas/Feedback" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/feedback/firebaseUid/{id}": {
      get: {
        tags: ["Feedback"],
        summary: "Get feedback by firebaseUid",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Firebase UID of the user",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "List of feedback by user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    feedbacks: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Feedback" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/feedback/search": {
      post: {
        tags: ["Feedback"],
        summary: "Search feedback",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/GetSearchedFeedbackRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Search results",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    feedbacks: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Feedback" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Report: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          reporterId: { type: "string" },
          reason: { type: "string" },
          resolved: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ReportPostRequest: {
        type: "object",
        required: ["postId", "reason"],
        properties: {
          postId: { type: "string", format: "uuid" },
          reason: { type: "string" },
        },
      },
      ReportProfileRequest: {
        type: "object",
        required: ["profileId", "reason"],
        properties: {
          profileId: { type: "string" },
          reason: { type: "string" },
        },
      },
      ReportMessageRequest: {
        type: "object",
        required: ["messageId", "reason"],
        properties: {
          messageId: { type: "string", format: "uuid" },
          reason: { type: "string" },
        },
      },
      Notification: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          body: { type: "string" },
          type: { type: "string" },
          data: { type: "object" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      FindTokensRequest: {
        type: "object",
        properties: {
          tokens: {
            type: "array",
            items: { type: "string" },
          },
          title: { type: "string" },
          body: { type: "string" },
        },
        required: ["tokens", "title", "body"],
      },
      RequestMatchNotificationRequest: {
        type: "object",
        properties: {
          requestId: { type: "string", format: "uuid" },
          firebaseUid: { type: "string" },
        },
        required: ["requestId", "firebaseUid"],
      },
      FcmTokenRequest: {
        type: "object",
        properties: {
          token: { type: "string" },
        },
        required: ["token"],
      },
      User: {
        type: "object",
        properties: {
          firebaseUid: { type: "string" },
          id: { type: "string" },
          username: { type: "string" },
          netid: { type: "string" },
          givenName: { type: "string" },
          familyName: { type: "string" },
          admin: { type: "boolean" },
          isActive: { type: "boolean" },
          stars: { type: "number" },
          numReviews: { type: "integer" },
          photoUrl: { type: "string" },
        },
      },
      CreateFeedbackRequest: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
        },
        required: ["title", "description"],
      },
      GetSearchedFeedbackRequest: {
        type: "object",
        properties: {
          query: { type: "string" },
        },
        required: ["query"],
      },
      Feedback: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          description: { type: "string" },
          firebaseUid: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};
