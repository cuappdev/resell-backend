module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Resell API',
    version: '1.0.0',
    description: 'API for the resell application',
  },
  servers: [
    {
      url: 'http://localhost:3000', // Base URL
      description: 'Development server',
    },
  ],
  paths: {
    '/report/admin/all/': {
      get: {
        tags: ['Report'],
        summary: 'Get all reports',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of all reports',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    reports: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Report' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/report/admin/post/': {
      get: {
        tags: ['Report'],
        summary: 'Get all post reports',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of all post reports',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    reports: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Report' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/report/admin/profile/': {
      get: {
        tags: ['Report'],
        summary: 'Get all profile reports',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of all profile reports',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    reports: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Report' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/report/admin/message/': {
      get: {
        tags: ['Report'],
        summary: 'Get all message reports',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of all message reports',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    reports: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Report' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/report/id/{id}/': {
      get: {
        tags: ['Report'],
        summary: 'Get report by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        responses: {
          '200': {
            description: 'Report details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    report: { $ref: '#/components/schemas/Report' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/report/reporter/id/{id}/': {
      get: {
        tags: ['Report'],
        summary: 'Get reports by reporter ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        responses: {
          '200': {
            description: 'List of reports by reporter',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    reports: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Report' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/report/post/': {
      post: {
        tags: ['Report'],
        summary: 'Report a post',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReportPostRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Report created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Report' }
              }
            }
          }
        }
      }
    },
    '/report/profile/': {
      post: {
        tags: ['Report'],
        summary: 'Report a profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReportProfileRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Report created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Report' }
              }
            }
          }
        }
      }
    },
    '/report/message/': {
      post: {
        tags: ['Report'],
        summary: 'Report a message',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReportMessageRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Report created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Report' }
              }
            }
          }
        }
      }
    },
    '/report/resolve/reportId/{id}/': {
      post: {
        tags: ['Report'],
        summary: 'Resolve a report',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        responses: {
          '200': {
            description: 'Report resolved',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Report' }
              }
            }
          }
        }
      }
    },
    '/report/delete/{id}/': {
      delete: {
        tags: ['Report'],
        summary: 'Delete a report',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        responses: {
          '200': {
            description: 'Report deleted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Report' }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Report: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          reporterId: { type: 'string', format: 'uuid' },
          reason: { type: 'string' },
          resolved: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      ReportPostRequest: {
        type: 'object',
        required: ['postId', 'reason'],
        properties: {
          postId: { type: 'string', format: 'uuid' },
          reason: { type: 'string' }
        }
      },
      ReportProfileRequest: {
        type: 'object',
        required: ['profileId', 'reason'],
        properties: {
          profileId: { type: 'string', format: 'uuid' },
          reason: { type: 'string' }
        }
      },
      ReportMessageRequest: {
        type: 'object',
        required: ['messageId', 'reason'],
        properties: {
          messageId: { type: 'string', format: 'uuid' },
          reason: { type: 'string' }
        }
      }
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
};