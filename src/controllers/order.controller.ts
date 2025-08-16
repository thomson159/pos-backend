import { NextFunction, Request } from 'express';
import { pool } from '../config/db';
import { INSERT_ORDER, INSERT_ORDER_ITEM, orderCreated, SELECT_ORDER } from 'src/consts';
import {
  CreateOrderBody,
  Order,
  OrderResponseType,
  OrderWithItems,
  OrderPromiseType,
  CreateOrderRequestType,
  CreateOrder,
  CreateOrderResponseType,
  CreateOrderPromiseType,
} from 'src/consts/types';
import { PoolClient } from 'pg';

export const createOrder = async (
  req: CreateOrderRequestType,
  res: CreateOrderResponseType,
  next: NextFunction,
): CreateOrderPromiseType => {
  const { customer, items, total }: CreateOrderBody = req.body;
  const client: PoolClient = await pool.connect();

  try {
    await client.query('BEGIN');

    const orderRes = await client.query(INSERT_ORDER, [customer, total]);
    const order: Order = orderRes.rows[0];
    const orderId = order.id;

    for (const item of items) {
      await client.query(INSERT_ORDER_ITEM, [orderId, item.product_id, item.quantity]);
    }

    await client.query('COMMIT');

    const response: CreateOrder = { message: orderCreated, orderId };

    return res.json(response);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

export const getOrders = async (
  _req: Request,
  res: OrderResponseType,
  next: NextFunction,
): OrderPromiseType => {
  try {
    const result = await pool.query(SELECT_ORDER);
    const orders: OrderWithItems[] = result.rows;

    return res.json(orders);
  } catch (err) {
    next(err);
  }
};
