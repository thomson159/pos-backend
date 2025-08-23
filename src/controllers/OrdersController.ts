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
import { AppError } from 'src/helpers';
import {
  createOrderExample,
  getOrderExample,
  INSERT_ORDER,
  INSERT_ORDER_ITEM,
  orderCreated,
  SELECT_ORDER_WITH_ITEMS,
  serverError,
} from 'src/consts';

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

function validateOrder(body: CreateOrderBody): {
  valid: boolean;
  errors: { property: string; message: string }[];
} {
  const errors: { property: string; message: string }[] = [];

  if (!body || typeof body !== 'object') {
    errors.push({ property: 'body', message: 'Request body must be an object' });
    return { valid: false, errors };
  }

  if (body.customer === undefined || typeof body.customer !== 'string' || !body.customer.trim()) {
    errors.push({ property: 'customer', message: 'Customer is required and must be a string' });
  }

  if (body.total === undefined || typeof body.total !== 'number' || body.total <= 0) {
    errors.push({ property: 'total', message: 'Total must be a number greater than 0' });
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.push({ property: 'items', message: 'Items must be a non-empty array' });
  } else {
    body.items.forEach((item: any, index: number) => {
      if (!Number.isInteger(item.product_id) || item.product_id < 1) {
        errors.push({
          property: `items[${index}].product_id`,
          message: 'Product ID must be an integer > 0',
        });
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        errors.push({
          property: `items[${index}].quantity`,
          message: 'Quantity must be an integer > 0',
        });
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

@Route('orders')
export class OrdersController extends Controller {
  @Post()
  @Security('bearerAuth')
  @SuccessResponse(200)
  @Example<CreateOrderResponse>(createOrderExample)
  @Response<OrderErrorResponse>(500, serverError)
  public async createOrder(
    @Body() body: CreateOrderBody,
    req: Request,
    res: ExResponse,
    next: NextFunction,
  ): Promise<CreateOrderResponse> {
    const validation = validateOrder(body);
    if (!validation.valid) {
      throw new AppError(400, 'Validation failed', validation.errors);
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
  @Response<OrderErrorResponse>(500, serverError)
  public async getOrders(): Promise<OrderWithItems[]> {
    try {
      return await fetchOrdersWithItems();
    } catch (err) {
      throw new AppError(500, serverError);
    }
  }
}

export async function insertOrderWithItems(
  client: PoolClient,
  customer: string,
  total: number,
  items: OrderItem[],
) {
  const orderRes = await client.query(INSERT_ORDER, [customer, total]);
  const orderId = orderRes.rows[0].id;

  for (const item of items) {
    await client.query(INSERT_ORDER_ITEM, [orderId, item.product_id, item.quantity]);
  }

  return orderId;
}

export async function fetchOrdersWithItems(): Promise<OrderWithItems[]> {
  const result = await pool.query(SELECT_ORDER_WITH_ITEMS);
  const ordersMap = new Map<number, OrderWithItems>();

  for (const row of result.rows) {
    if (!ordersMap.has(row.id)) {
      ordersMap.set(row.id, {
        id: row.id,
        customer: row.customer,
        total: row.total,
        created_at: row.created_at,
        items: [],
      });
    }

    if (row.product_id) {
      ordersMap.get(row.id)!.items.push({
        product_id: row.product_id,
        quantity: row.quantity,
        product_name: row.product_name,
        product_price: Number(row.product_price),
      });
    }
  }

  return Array.from(ordersMap.values());
}
