import {
  linkLogin,
  correctEmail,
  correctPassword,
  linkOrders,
  DELETE_USER,
  INSERT_USER,
  getUseMocks,
} from './consts';
import { foreignKeyViolation, noTokenProvided, orderCreated } from 'src/consts';

let token: string;
const useMocks = getUseMocks();

import request from 'supertest';
import app from '../src/app';
import { pool } from '../src/config/db';
import bcrypt from 'bcrypt';

describe('Orders API - with DataBase', () => {
  beforeAll(async () => {
    const hashed = await bcrypt.hash(correctPassword, 10);
    await pool.query(INSERT_USER, [correctEmail, hashed]);
  });

  beforeEach(async () => {
    const res = await request(app)
      .post(linkLogin)
      .send({ email: correctEmail, password: correctPassword });

    token = res.body.token || res.body?.data?.token;
    if (!token) throw new Error('Token not received, check login credentials');
  });

  afterAll(async () => {
    await pool.query(DELETE_USER, [correctEmail]);
    await pool.end();
  });

  it('✅ should get all orders', async () => {
    const res = await request(app).get(linkOrders).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      const order = res.body[0];
      expect(order).toHaveProperty('id');
      expect(order).toHaveProperty('customer');
      expect(order).toHaveProperty('total');
      expect(order).toHaveProperty('created_at');
    }
  });

  it('✅ should create a new order', async () => {
    const orderData = {
      customer: 'Jan Kowalski',
      total: 99.99,
      items: [{ product_id: 1, quantity: 2 }],
    };

    const res = await request(app)
      .post(linkOrders)
      .set('Authorization', `Bearer ${token}`)
      .send(orderData);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('orderId');
    expect(typeof res.body.orderId).toBe('number');
    expect(res.body).toHaveProperty('message', orderCreated);
  });

  it('❌ should block order creation without token', async () => {
    const orderData = { customer: 'Anon', total: 10, items: [] };

    const res = await request(app).post(linkOrders).send(orderData);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', noTokenProvided);
  });

  it('❌ should reject get all orders without token', async () => {
    const res = await request(app).get(linkOrders);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', noTokenProvided);
  });

  if (!useMocks) {
    it('❌ should not create a new order - missing product', async () => {
      const orderData = {
        customer: 'Jan Kowalski',
        total: 99.99,
        items: [{ product_id: 100000, quantity: 2 }],
      };

      const res = await request(app)
        .post(linkOrders)
        .set('Authorization', `Bearer ${token}`)
        .send(orderData);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toMatch(foreignKeyViolation);
    });
  }

  it('❌ invalid quantity', async () => {
    const orderData = {
      customer: 'Jan Kowalski',
      total: 50,
      items: [{ product_id: 1, quantity: -5 }],
    };

    const res = await request(app)
      .post(linkOrders)
      .set('Authorization', `Bearer ${token}`)
      .send(orderData);

    expect(res.status).toBe(400);
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'items[0].quantity',
          message: 'Quantity must be an integer > 0',
        }),
      ]),
    );
  });

  it('❌ invalid productId', async () => {
    const orderData = { customer: 'Jan Kowalski', total: 50, items: [{ quantity: 1 }] };

    const res = await request(app)
      .post(linkOrders)
      .set('Authorization', `Bearer ${token}`)
      .send(orderData);

    expect(res.status).toBe(400);
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'items[0].product_id',
          message: 'Product ID must be an integer > 0',
        }),
      ]),
    );
  });

  it('❌ invalid customer', async () => {
    const orderData = { customer: 0, total: 50, items: [{ product_id: 1, quantity: 1 }] };

    const res = await request(app)
      .post(linkOrders)
      .set('Authorization', `Bearer ${token}`)
      .send(orderData);

    expect(res.status).toBe(400);
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'customer',
          message: 'Customer is required and must be a string',
        }),
      ]),
    );
  });

  it('❌ invalid total', async () => {
    const orderData = {
      customer: 'Jan Kowalski',
      total: 'not-a-number',
      items: [{ product_id: 1, quantity: 1 }],
    };

    const res = await request(app)
      .post(linkOrders)
      .set('Authorization', `Bearer ${token}`)
      .send(orderData);

    expect(res.status).toBe(400);
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'total',
          message: 'Total must be a number greater than 0',
        }),
      ]),
    );
  });

  it('❌ invalid items (empty array)', async () => {
    const orderData = { customer: 'Jan Kowalski', total: 1, items: [] };

    const res = await request(app)
      .post(linkOrders)
      .set('Authorization', `Bearer ${token}`)
      .send(orderData);

    expect(res.status).toBe(400);
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'items',
          message: 'Items must be a non-empty array',
        }),
      ]),
    );
  });

  it('❌ completely empty order', async () => {
    const orderData = {};

    const res = await request(app)
      .post(linkOrders)
      .set('Authorization', `Bearer ${token}`)
      .send(orderData);

    expect(res.status).toBe(400);
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'customer',
          message: 'Customer is required and must be a string',
        }),
        expect.objectContaining({
          property: 'items',
          message: 'Items must be a non-empty array',
        }),
      ]),
    );
  });
});
