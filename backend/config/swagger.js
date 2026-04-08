const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'OTT Messaging Platform API',
    version: '1.1.0',
    description: 'REST API for auth, users, friends, conversations, messages, media and notifications.',
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Development',
    },
  ],
  tags: [
    { name: 'Auth' },
    { name: 'Users' },
    { name: 'Friends' },
    { name: 'Conversations' },
    { name: 'Messages' },
    { name: 'Media' },
    { name: 'Notifications' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ApiSuccess: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
          message: { type: 'string', example: 'OK' },
        },
      },
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Invalid payload' },
              details: { type: 'object', nullable: true },
            },
          },
        },
      },
      RegisterInput: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: { type: 'string', minLength: 3, maxLength: 50 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6, maxLength: 100 },
          phone: { type: 'string', nullable: true },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['password'],
        properties: {
          email: { type: 'string', format: 'email' },
          username: { type: 'string' },
          password: { type: 'string' },
        },
      },
      RefreshInput: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
      UpdateUserInput: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          phone: { type: 'string', nullable: true },
          avatarUrl: { type: 'string', nullable: true },
        },
      },
      BlockUserInput: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['block', 'unblock'], default: 'block' },
        },
      },
      FriendRequestInput: {
        type: 'object',
        required: ['toUserId'],
        properties: {
          toUserId: { type: 'string' },
        },
      },
      ConversationInput: {
        type: 'object',
        required: ['participantIds'],
        properties: {
          type: { type: 'string', enum: ['direct', 'group'], default: 'direct' },
          name: { type: 'string' },
          participantIds: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
      SendMessageInput: {
        type: 'object',
        required: ['conversationId'],
        properties: {
          conversationId: { type: 'string' },
          content: { type: 'string', default: '' },
          mediaIds: {
            type: 'array',
            items: { type: 'string' },
            default: [],
          },
          replyTo: { type: 'string' },
          forwardFrom: { type: 'string' },
        },
      },
      UploadMediaInput: {
        type: 'object',
        required: ['fileName', 'mimeType', 'contentBase64'],
        properties: {
          fileName: { type: 'string' },
          mimeType: { type: 'string' },
          contentBase64: { type: 'string', description: 'Raw base64 string without data URI prefix.' },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
          },
        },
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
          },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'User registered',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
          '409': {
            description: 'User exists',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login by email or username',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login success',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/refresh-token': {
      post: {
        tags: ['Auth'],
        summary: 'Rotate refresh token and issue new token pair',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Token refreshed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout current refresh token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Logout success',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
    },
    '/auth/logout-all': {
      post: {
        tags: ['Auth'],
        summary: 'Logout all devices',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'All sessions revoked',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user profile',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'User fetched',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update user profile',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateUserInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'User updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Soft delete user',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'User deleted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
    },
    '/users/block/{id}': {
      post: {
        tags: ['Users'],
        summary: 'Block or unblock user',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BlockUserInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Block status updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
    },
    '/friends/request': {
      post: {
        tags: ['Friends'],
        summary: 'Send friend request',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FriendRequestInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Friend request sent',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
    },
    '/friends/request/{id}/accept': {
      put: {
        tags: ['Friends'],
        summary: 'Accept friend request',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Request accepted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
    },
    '/friends/request/{id}/reject': {
      put: {
        tags: ['Friends'],
        summary: 'Reject friend request',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Request rejected',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
    },
    '/friends/{friendId}': {
      delete: {
        tags: ['Friends'],
        summary: 'Remove friend',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'friendId', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Friend removed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
    },
    '/friends/list': {
      get: {
        tags: ['Friends'],
        summary: 'Get friend list',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Friend list fetched',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
    },
    '/conversations': {
      get: {
        tags: ['Conversations'],
        summary: 'List conversations',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Conversations fetched',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Conversations'],
        summary: 'Create conversation',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ConversationInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Conversation created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
    },
    '/messages/send': {
      post: {
        tags: ['Messages'],
        summary: 'Send message',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SendMessageInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Message sent',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
    },
    '/messages/conversation/{id}': {
      get: {
        tags: ['Messages'],
        summary: 'List messages by conversation (cursor pagination)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
          { in: 'query', name: 'limit', required: false, schema: { type: 'integer', default: 20 } },
          { in: 'query', name: 'cursor', required: false, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Messages fetched',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
    },
    '/messages/{id}/read': {
      put: {
        tags: ['Messages'],
        summary: 'Mark message as read',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Message marked as read',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
    },
    '/messages/{id}': {
      delete: {
        tags: ['Messages'],
        summary: 'Delete message',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Message deleted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
    },
    '/media/upload': {
      post: {
        tags: ['Media'],
        summary: 'Upload media as base64',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UploadMediaInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Media uploaded',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
    },
    '/media/{id}': {
      get: {
        tags: ['Media'],
        summary: 'Get media metadata',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Media fetched',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Media'],
        summary: 'Delete media by id',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Media deleted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
    },
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Get notifications',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'page', required: false, schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', required: false, schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          '200': {
            description: 'Notifications fetched',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
    },
    '/notifications/{id}/read': {
      put: {
        tags: ['Notifications'],
        summary: 'Mark notification as read',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Notification marked as read',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
