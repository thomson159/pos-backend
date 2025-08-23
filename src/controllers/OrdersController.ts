import {
  Controller,
  Route,
  Post,
  Get,
  Body,
  Response,
  SuccessResponse,
  Example,
  Security,
} from 'tsoa';
import { pool } from '../config/db';
import { PoolClient } from 'pg';
import type { Request, Response as ExResponse, NextFunction } from 'express';
import { AppError, fetchOrdersWithItems, insertOrderWithItems } from 'src/helpers';
import {
  createOrderExample,
  getOrderExample,
  noTokenProvided,
  orderCreated,
  serverError,
} from 'src/consts';
import { validateOrder, validationFailed } from 'src/helpers/validators';
import { ErrorResponse } from './AuthController';

export interface OrderItem {
  product_id: number;
  quantity: number;
}

export interface CreateOrderBody {
  customer: string;
  total: number;
  items: OrderItem[];
}

export interface CreateOrderResponse {
  message: string;
  orderId: number;
}

export interface OrderItemDetails {
  product_id: number;
  quantity: number;
  product_name: string;
  product_price: number;
}

export interface OrderWithItems {
  id: number;
  customer: string;
  total: number;
  created_at: string;
  items: OrderItemDetails[];
}

interface OrderErrorResponse {
  message: string;
}

@Route('orders')
export class OrdersController extends Controller {
  @Post()
  @Security('bearerAuth')
  @SuccessResponse(200)
  @Example<CreateOrderResponse>(createOrderExample)
  // @Response<ErrorResponse>(400, noTokenProvided) //TODO: response 400
  @Response<ErrorResponse>(401, noTokenProvided)
  @Response<OrderErrorResponse>(500, serverError)
  public async createOrder(@Body() body: CreateOrderBody): Promise<CreateOrderResponse> {
    const validation = validateOrder(body);
    if (!validation.valid) {
      throw new AppError(400, validationFailed, validation.errors);
    }

    const client: PoolClient = await pool.connect();
    try {
      await client.query('BEGIN');
      const orderId = await insertOrderWithItems(client, body.customer, body.total, body.items);
      await client.query('COMMIT');
      return { message: orderCreated, orderId };
    } catch (err) {
      await client.query('ROLLBACK');
      throw new AppError(500, serverError);
    } finally {
      client.release();
    }
  }

  @Get()
  @Security('bearerAuth')
  @SuccessResponse(200)
  @Example<OrderWithItems[]>(getOrderExample)
  @Response<ErrorResponse>(401, noTokenProvided)
  @Response<OrderErrorResponse>(500, serverError)
  public async getOrders(): Promise<OrderWithItems[]> {
    try {
      return await fetchOrdersWithItems();
    } catch (err) {
      throw new AppError(500, serverError);
    }
  }
}
