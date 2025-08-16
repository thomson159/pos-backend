import { ValidationError } from 'express-validator';
import { Request, Response } from 'express';
import { dbMessage, orderCreated } from '.';
import { JwtPayload } from 'jsonwebtoken';

export type ValidationErrorType = ValidationError & { param: string };

export type ConfigType = {
  port: number | string;
  dbUrl: string;
  jwtSecret: string;
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

export type ProductListResponse = Product[];

export type SyncSuccessResponse = {
  message: typeof dbMessage;
};

export type ErrorResponse = {
  message: string;
};

export type UserFromDB = {
  id: number;
  email: string;
  password: string;
  role: string;
};

export type Product = {
  id: number;
  title: string;
  price: number;
  category: string;
  description: string;
  image: string;
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

export type LoginBody = {
  email: string;
  password: string;
};

export type CreateOrder = {
  message: typeof orderCreated;
  orderId: number;
};

type LoginSuccessResponse = {
  token: string;
};

export type LoginResponse = LoginSuccessResponse | ErrorResponse;
export type LoginResponseType = Response<LoginResponse>;
export type LoginRequestType = Request<{}, {}, LoginBody>;
export type LoginPromiseType = Promise<LoginResponseType | ErrorResponse | undefined>;

export type CreateOrderResponseType = Response<CreateOrder>;
export type CreateOrderRequestType = Request<{}, {}, CreateOrderBody>;
export type CreateOrderPromiseType = Promise<CreateOrderResponseType | undefined>;

export type OrderResponseType = Response<OrderWithItems[]>;
export type OrderPromiseType = Promise<OrderResponseType | undefined>;

export type SyncType = SyncSuccessResponse | ErrorResponse;
export type SyncResponseType = Response<SyncType>;
export type SyncPromiseType = Promise<SyncResponseType | undefined>;

export type ProductResponseType = Response<ProductListResponse>;
export type ProductPromiseType = Promise<ProductResponseType | undefined>;

export interface AppError extends Error {
  status?: number;
  code?: string;
}

export interface TokenPayload extends JwtPayload {
  id: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}
