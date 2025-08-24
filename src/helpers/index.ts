import { PoolClient } from 'pg';
import { pool } from '../config/db';
import { INSERT_ORDER, INSERT_ORDER_ITEM, SELECT_ORDER_WITH_ITEMS } from '../consts';
import { OrderItem, OrderWithItems } from '../controllers/OrdersController';

export class AppError extends Error {
  status: number;
  errors?: unknown[];

  constructor(status: number, message: string, errors?: unknown[]) {
    super(message);
    this.status = status;
    if (errors) this.errors = errors;
  }
}

export class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
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
