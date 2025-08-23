import {
  linkLogin,
  correctEmail,
  correctPassword,
  linkOrders,
  DELETE_USER,
  INSERT_USER,
  getUseMocks,
  invalidFloat,
  invalidObject,
  invalidString,
} from './consts';

let token: string;
const useMocks = getUseMocks();

import request from 'supertest';
import app from '../src/app';
import { pool } from '../src/config/db';
import bcrypt from 'bcrypt';
import { orderCreated, noTokenProvided } from 'src/consts';
import { customer, items, productId, quantity, total } from 'src/helpers/validators';

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
          message: quantity,
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
          message: productId,
        }),
      ]),
    );
  });

  it('❌ invalid customer', async () => {
    const orderData = { total: 50, items: [{ product_id: 1, quantity: 1 }] };

    const res = await request(app)
      .post(linkOrders)
      .set('Authorization', `Bearer ${token}`)
      .send(orderData);

    expect(res.status).toBe(400);
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'customer',
          message: customer,
        }),
      ]),
    );
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
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'total',
          message: total,
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
          message: items,
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
          message: customer,
        }),
        expect.objectContaining({
          property: 'items',
          message: items,
        }),
      ]),
    );
  });

  // Validators should check the data type,
  // but in this case if the data type is wrong
  // (total: 'not-a-number' & customer: 0 & items: 2),
  // tsoa catches it faster (type from db) before our validator and handles the error itself
  //
  // invalid float number & invalid string value & invalid object <- tsoa handler error, not ours
  //
  it('❌ invalid total, customer, items - wrong type', async () => {
    const orderData = {
      customer: 0,
      total: 'not-a-number',
      items: 2,
    };

    const res = await request(app)
      .post(linkOrders)
      .set('Authorization', `Bearer ${token}`)
      .send(orderData);

    expect(res.status).toBe(400);

    const details = Object.entries(res.body.details as Record<string, { message: string }>).map(
      ([key, value]) => ({
        property: key,
        message: value.message,
      }),
    );

    expect(details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'body.customer',
          message: invalidString,
        }),
        expect.objectContaining({
          property: 'body.total',
          message: invalidFloat,
        }),
        expect.objectContaining({
          property: 'items.$0', // <- here there is a slightly different format of the property value
          message: invalidObject,
        }),
      ]),
    );
  });

  // Validators should check the data type,
  // but in this case if the data type is wrong
  // (items: [{ product_id: 'dummy', quantity: 'dummy' }]),
  // tsoa catches it faster (type from db) before our validator and handles the error itself
  //
  // invalid float number <- tsoa handler error, not ours
  //
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

    const details = Object.entries(res.body.details as Record<string, { message: string }>).map(
      ([key, value]) => ({
        property: key,
        message: value.message,
      }),
    );

    expect(details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'items.$0.product_id',
          message: invalidFloat,
        }),
        expect.objectContaining({
          property: 'items.$0.quantity',
          message: invalidFloat,
        }),
      ]),
    );
  });
});
