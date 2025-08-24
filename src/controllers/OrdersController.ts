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
import { AppError, fetchOrdersWithItems, insertOrderWithItems } from '../helpers';
import {
  createOrderExample,
  getOrderExample,
  noTokenProvided,
  orderCreated,
  serverError,
} from '../consts';
import { validateOrder, validationFailed } from '../helpers/validators';
import { ErrorResponse401, ErrorResponse500 } from './AuthController';

export interface OrderItem {
  product_id: number;
  quantity: number;
}

export interface CreateOrder {
  customer: string;
  total: number;
  items: OrderItem[];
}

export interface CreateOrderSuccess {
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

@Route('orders')
export class OrdersController extends Controller {
  @Post()
  @Security('bearerAuth')
  @SuccessResponse(200)
  @Example<CreateOrderSuccess>(createOrderExample)
  @Response<ErrorResponse401>(401, noTokenProvided)
  @Response<ErrorResponse500>(500, serverError)
  public async createOrder(@Body() body: CreateOrder): Promise<CreateOrderSuccess> {
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
  @Response<ErrorResponse401>(401, noTokenProvided)
  @Response<ErrorResponse500>(500, serverError)
  public async getOrders(): Promise<OrderWithItems[]> {
    try {
      return await fetchOrdersWithItems();
    } catch (err) {
      throw new AppError(500, serverError);
    }
  }
}
