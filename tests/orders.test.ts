import {
  linkLogin,
  correctEmail,
  correctPassword,
  linkOrders,
  DELETE_USER,
  INSERT_USER,
  getUseMocks,
} from './consts';
import { orderCreated, noTokenProvided } from 'src/consts';

const useMocks = getUseMocks();
let token: string;

if (useMocks) {
  jest.mock('src/middleware/auth', () => ({
    __esModule: true,
    default: (req: any, res: any, next: any) => {
      req.user = { id: 1, email: 'mock@example.com' };
      next();
    },
  }));
}

import request from 'supertest';
import app from '../src/app';
import { pool } from '../src/config/db';
import bcrypt from 'bcrypt';

describe('Orders API', () => {
  if (!useMocks) {
    beforeAll(async () => {
      const hashed = await bcrypt.hash(correctPassword, 10);
      await pool.query(INSERT_USER, [correctEmail, hashed]);
    });

    afterAll(async () => {
      await pool.query(DELETE_USER, [correctEmail]);
      await pool.end();
    });
  }

  beforeEach(async () => {
    if (useMocks) {
      token = 'mockToken';
    } else {
      const res = await request(app)
        .post(linkLogin)
        .send({ email: correctEmail, password: correctPassword });
      token = res.body.token || res.body?.data?.token;
      if (!token) throw new Error('Token not received');
    }
  });

  it('✅ should get all orders', async () => {
    const res = await request(app).get(linkOrders).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
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
    expect(res.body).toHaveProperty('message', orderCreated);
  });

  it('❌ should block order creation without token', async () => {
    const res = await request(app)
      .post(linkOrders)
      .send({ customer: 'Anon', total: 10, items: [] });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', noTokenProvided);
  });

  it('❌ should reject get all orders without token', async () => {
    const res = await request(app).get(linkOrders);
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', noTokenProvided);
  });

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
  });

  it('❌ invalid productId', async () => {
    const orderData = { customer: 'Jan Kowalski', total: 50, items: [{ quantity: 1 }] };
    const res = await request(app)
      .post(linkOrders)
      .set('Authorization', `Bearer ${token}`)
      .send(orderData);
    expect(res.status).toBe(400);
  });

  it('❌ invalid customer', async () => {
    const orderData = { total: 50, items: [{ product_id: 1, quantity: 1 }] };
    const res = await request(app)
      .post(linkOrders)
      .set('Authorization', `Bearer ${token}`)
      .send(orderData);
    expect(res.status).toBe(400);
  });

  it('❌ invalid total', async () => {
    const orderData = {
      customer: 'Jan Kowalski',
      total: 0,
      items: [{ product_id: 1, quantity: 1 }],
    };
    const res = await request(app)
      .post(linkOrders)
      .set('Authorization', `Bearer ${token}`)
      .send(orderData);
    expect(res.status).toBe(400);
  });

  it('❌ invalid items (empty array)', async () => {
    const orderData = { customer: 'Jan Kowalski', total: 1, items: [] };
    const res = await request(app)
      .post(linkOrders)
      .set('Authorization', `Bearer ${token}`)
      .send(orderData);
    expect(res.status).toBe(400);
  });

  it('❌ completely empty order', async () => {
    const res = await request(app)
      .post(linkOrders)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('❌ invalid total, customer, items - wrong type', async () => {
    const orderData = { customer: 0, total: 'not-a-number', items: 2 };
    const res = await request(app)
      .post(linkOrders)
      .set('Authorization', `Bearer ${token}`)
      .send(orderData);
    expect(res.status).toBe(400);
  });

  it('❌ invalid items, product_id, quantity - wrong type', async () => {
    const orderData = {
      customer: 'dummy',
      total: 1,
      items: [{ product_id: 'dummy', quantity: 'dummy' }],
    };
    const res = await request(app)
      .post(linkOrders)
      .set('Authorization', `Bearer ${token}`)
      .send(orderData);
    expect(res.status).toBe(400);
  });
});
