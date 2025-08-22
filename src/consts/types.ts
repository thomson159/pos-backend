import { ValidationError } from 'express-validator';
import { Request, Response } from 'express';
import { dbMessage, orderCreated } from '.';

export type ValidationErrorType = ValidationError & { param: string };

export type ConfigType = {
  port: number | string;
  dbUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string | number;
};

export type SwaggerOptionsType = {
  definition: {
    openapi: '3.0.0';
    info: {
      title: string;
      version: string;
      description: string;
    };
    servers: {
      url: string;
    }[];
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http';
          scheme: 'bearer';
          bearerFormat: string;
        };
      };
    };
    security: {
      bearerAuth: string[];
    }[];
  };
  apis: string[];
};

export type SyncSuccessResponse = {
  message: typeof dbMessage;
};

export type Order = {
  id: number;
  customer: string;
  total: number;
  created_at: string | Date;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
};

export type OrderWithItems = Order & {
  items: OrderItem[];
};

export type OrderItemInput = {
  product_id: number;
  quantity: number;
};

export type CreateOrderBody = {
  customer: string;
  items: OrderItemInput[];
  total: number;
};

export type CreateOrder = {
  message: typeof orderCreated;
  orderId: number;
};

export type CreateOrderResponseType = Response<CreateOrder>;
export type CreateOrderRequestType = Request<{}, {}, CreateOrderBody>;
export type CreateOrderPromiseType = Promise<CreateOrderResponseType | undefined>;

export type OrderResponseType = Response<OrderWithItems[]>;
export type OrderPromiseType = Promise<OrderResponseType | undefined>;

// export type SyncType = SyncSuccessResponse | ErrorResponse;
// export type SyncResponseType = Response<SyncType>;
// export type SyncPromiseType = Promise<SyncResponseType | undefined>;
