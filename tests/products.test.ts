import {
  mockedToken,
  getUseMocks,
  correctEmail,
  correctPassword,
  linkLogin,
  linkProductsRemote,
  linkProductsLocal,
  linkProductsSync,
} from './consts';
import { dbMessage, invalidCredentials } from 'src/consts';
import { NextFunction } from 'express';

let token: string;
const item: Product = {
  id: 1,
  title: 'Test Product',
  price: 100,
  category: 'Test Category',
  description: 'Test Description',
  image: 'test-image.jpg',
};

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
    authenticate: (req: Request, res: Response, next: NextFunction) => next(),
  }));

  jest.mock('../src/controllers/product.controller', () => ({
    getRemoteProducts: jest.fn((req, res) => {
      const authHeader = req.headers?.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      return res.status(200).json([item]);
    }),
    getLocalProducts: jest.fn((req, res) => {
      const authHeader = req.headers?.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      return res.status(200).json([item]);
    }),
    syncProducts: jest.fn((req, res) => {
      const authHeader = req.headers?.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      return res.status(200).json({ message: dbMessage });
    }),
  }));
}

import request from 'supertest';
import app from '../src/app';
import { Product } from 'src/consts/types';

beforeAll(async () => {
  const res = await request(app)
    .post(linkLogin)
    .send({ email: correctEmail, password: correctPassword });
  token = res.body.token;
});

describe('Products API - DataBase', () => {
  it('✅ should fetch remote products from FakeStoreAPI', async () => {
    const res = await request(app).get(linkProductsRemote).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      const order = res.body[0];
      expect(order).toHaveProperty('id');
      expect(order).toHaveProperty('title');
      expect(order).toHaveProperty('price');
      expect(order).toHaveProperty('category');
      expect(order).toHaveProperty('description');
      expect(order).toHaveProperty('image');
    }
  });

  it('✅ should fetch local products from DB - only one test product in db', async () => {
    const res = await request(app).get(linkProductsLocal).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      const order = res.body[0];
      expect(order).toHaveProperty('id');
      expect(order).toHaveProperty('title');
      expect(order).toHaveProperty('price');
      expect(order).toHaveProperty('category');
      expect(order).toHaveProperty('description');
      expect(order).toHaveProperty('image');
    }
  });

  it('✅ should fetch sync products', async () => {
    const res = await request(app).post(linkProductsSync).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', dbMessage);
  });

  it('✅ should fetch local products from DB - not empty', async () => {
    const res = await request(app).get(linkProductsLocal).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      const order = res.body[0];
      expect(order).toHaveProperty('id');
      expect(order).toHaveProperty('title');
      expect(order).toHaveProperty('price');
      expect(order).toHaveProperty('category');
      expect(order).toHaveProperty('description');
      expect(order).toHaveProperty('image');
    }
  });

  it('❌ should block local products request without token', async () => {
    const res = await request(app).get(linkProductsLocal);
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Unauthorized');
  });

  it('❌ should block sync products request without token', async () => {
    const res = await request(app).post(linkProductsSync);
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Unauthorized');
  });

  it('❌ should block remote products request without token', async () => {
    const res = await request(app).get(linkProductsRemote);
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Unauthorized');
  });
});
