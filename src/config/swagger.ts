import { SwaggerOptionsType } from 'src/consts';
import swaggerJsdoc from 'swagger-jsdoc';

const options: SwaggerOptionsType = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'POS API',
      version: '1.0.0',
      description: 'A simple POS application for both brick-and-mortar and online stores',
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
