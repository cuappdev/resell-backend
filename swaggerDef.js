module.exports = {
    openapi: '3.0.0',
    info: {
      title: 'Resell API',
      version: '1.0.0',
      description: 'API for the resell application',
    },
    servers: [
      {
        url: 'http://localhost:3000/api-docs', // Update with the server URL
        description: 'Development server',
      },
    ],
  };