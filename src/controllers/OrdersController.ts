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
import { IsString, IsNumber, Min, ValidateNested, ArrayMinSize, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItem {
  @IsInt({ message: 'Product ID must be an integer greater than 0' })
  @Min(1)
  product_id: number = 0;

  @IsInt({ message: 'Quantity must be an integer greater than 0' })
  @Min(1)
  quantity: number = 1;
}

export class CreateOrderBody {
  @IsString({ message: 'The "customer" field is required and must be a string' })
  customer: string = '';

  @IsNumber({}, { message: 'Total must be a number greater than 0' })
  @Min(0.01)
  total: number = 0.01;

  @ArrayMinSize(1, { message: 'Product list is required' })
  @ValidateNested({ each: true })
  @Type(() => OrderItem)
  items: OrderItem[] = [];
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
  @Response<OrderErrorResponse>(500, serverError)
  public async createOrder(@Body() body: CreateOrderBody): Promise<CreateOrderResponse> {
    const { customer, items, total } = body;
    const client: PoolClient = await pool.connect();

    try {
      await client.query('BEGIN');
      const orderId = await insertOrderWithItems(client, customer, total, items);
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
