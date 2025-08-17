import {
  foreignKeyViolation,
  orderCreated,
  noTokenProvided,
  validateError,
  quantity,
  productId,
  customer,
  total,
  items,
  invalidCredentials,
} from 'src/consts';
import {
  linkLogin,
  correctEmail,
  correctPassword,
  getUseMocks,
  mockedToken,
  linkOrders,
  wrongEmail,
} from './consts';
import { Request, Response, NextFunction } from 'express';
import { CreateOrder, OrderWithItems } from 'src/consts/types';

let token: string;
const useMocks = getUseMocks();

if (useMocks) {
  jest.mock('../src/controllers/auth.controller', () => ({
    login: jest.fn((req, res) => {
      const { email, password } = req.body;
      if (email === correctEmail && password === correctPassword) {
        return res.status(200).json({ token: mockedToken });
      } else {
        return res.status(401).json({ message: invalidCredentials });
      }
    }),
  }));

  jest.mock('../src/middleware/auth', () => ({
    authenticate: (req: Request, res: Response, next: NextFunction) => {
      const authHeader = req.headers['authorization'] as string | undefined;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: noTokenProvided,
          errors: [],
        });
      }

      next();
    },
  }));

  jest.mock('../src/controllers/order.controller', () => ({
    getOrders: jest.fn((req, res) => {
      const authHeader = req.headers?.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: noTokenProvided,
          errors: [],
        });
      }

      const response: OrderWithItems[] = [
        {
          id: 1,
          customer: 'Jan Kowalski',
          total: 10,
          created_at: new Date().toISOString(),
          items: [
            {
              id: 1,
              order_id: 1,
              product_id: 1,
              quantity: 1,
            },
          ],
        },
      ];

      return res.status(200).json(response);
    }),

    createOrder: jest.fn((req, res) => {
      const authHeader = req.headers?.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: noTokenProvided });
      }

      const response: CreateOrder = { message: orderCreated, orderId: 1 };

      return res.status(200).json(response);
    }),
  }));
}

import request from 'supertest';
import app from '../src/app';
import { pool } from '../src/config/db';
import bcrypt from 'bcrypt';

describe('Orders API - with DataBase', () => {
  beforeEach(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [correctEmail]);

    const hash = await bcrypt.hash(correctPassword, 10);
    await pool.query(`INSERT INTO users (email, password) VALUES ($1, $2)`, [correctEmail, hash]);

    const res = await request(app)
      .post(linkLogin)
      .send({ email: correctEmail, password: correctPassword });

    token = res.body.token;
  });

  afterAll(async () => {
    await pool.end();
  });

  it('❌ should block order creation without token', async () => {
    await request(app).post(linkLogin).send({ email: wrongEmail, password: correctPassword });

    const orderData = {
      customer: 'Anon',
      total: 10,
      items: [],
    };

    const res = await request(app).post(linkOrders).send(orderData);

    expect(res.body).toHaveProperty('message');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success', false);
    expect(typeof res.body.message).toBe('string');
    expect(res.body.message).toMatch(noTokenProvided);
    expect(res.body).toHaveProperty('errors');
    expect(Array.isArray(res.body.errors)).toBe(true);
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
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message');
      expect(typeof res.body.message).toBe('string');
      expect(res.body.message).toMatch(foreignKeyViolation);
      expect(res.body).toHaveProperty('errors');
      expect(Array.isArray(res.body.errors)).toBe(true);
    });
  }

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

  it('❌ should reject order with invalid quantity (validation test)', async () => {
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
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message', validateError);
    expect(res.body).toHaveProperty('errors');
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'unknown',
          message: expect.stringMatching(quantity),
        }),
      ]),
    );
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

  it('❌ should reject order with invalid productId (validation test)', async () => {
    const orderData = {
      customer: 'Jan Kowalski',
      total: 50,
      items: [{ quantity: 1 }],
    };

    const res = await request(app)
      .post(linkOrders)
      .set('Authorization', `Bearer ${token}`)
      .send(orderData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message', validateError);
    expect(res.body).toHaveProperty('errors');
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'unknown',
          message: expect.stringMatching(productId),
        }),
      ]),
    );
  });

  it('❌ should reject order with invalid customer (validation test)', async () => {
    const orderData = {
      customer: 0,
      total: 50,
      items: [{ product_id: 1, quantity: 1 }],
    };

    const res = await request(app)
      .post(linkOrders)
      .set('Authorization', `Bearer ${token}`)
      .send(orderData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message', validateError);
    expect(res.body).toHaveProperty('errors');
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'unknown',
          message: expect.stringMatching(customer),
        }),
      ]),
    );
  });

  it('❌ should reject order with invalid total (validation test)', async () => {
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
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message', validateError);
    expect(res.body).toHaveProperty('errors');
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'unknown',
          message: expect.stringMatching(total),
        }),
      ]),
    );
  });

  it('❌ should reject order with invalid items (validation test)', async () => {
    const orderData = {
      customer: 'Jan Kowalski',
      total: 1,
      items: [],
    };

    const res = await request(app)
      .post(linkOrders)
      .set('Authorization', `Bearer ${token}`)
      .send(orderData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message', validateError);
    expect(res.body).toHaveProperty('errors');
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'unknown',
          message: expect.stringMatching(items),
        }),
      ]),
    );
  });

  it('❌ should reject order with invalid order (validation test)', async () => {
    const orderData = {};

    const res = await request(app)
      .post(linkOrders)
      .set('Authorization', `Bearer ${token}`)
      .send(orderData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message', validateError);
    expect(res.body).toHaveProperty('errors');
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'unknown',
          message: expect.stringMatching(items),
        }),
      ]),
    );
  });
});
