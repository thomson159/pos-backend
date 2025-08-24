import { noTokenProvided, syncSuccess } from 'src/consts';
import {
  linkProductsRemote,
  linkProductsLocal,
  DELETE_USER,
  INSERT_USER,
  correctEmail,
  correctPassword,
  linkLogin,
  linkProductsSync,
  getUseMocks,
} from './consts';

let token: string;
const useMocks = getUseMocks();

if (useMocks) {
  jest.mock('src/config/db', () => ({
    pool: {
      query: jest.fn().mockResolvedValue({
        rows: [
          {
            id: 1,
            title: 'Mock Product',
            price: 10,
            category: 'Mock Category',
            description: 'Mock Description',
            image: 'mock-image.png',
          },
        ],
      }),
      end: jest.fn(),
    },
  }));

  jest.mock('bcrypt', () => ({
    compare: jest.fn().mockResolvedValue(true),
    hash: jest.fn().mockResolvedValue('hashedPassword'),
  }));

  jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(() => 'mockToken'),
    verify: jest.fn(() => ({ id: 1, email: correctEmail })),
  }));

  const authMiddleware = require('src/middleware/auth');
  authMiddleware.default = function (
    req: { user: { id: number; email: string } },
    res: any,
    next: () => void,
  ) {
    req.user = { id: 1, email: correctEmail };
    next();
  };
}

import request from 'supertest';
import app from 'src/app';
import { pool } from 'src/config/db';
import bcrypt from 'bcrypt';

describe('Products API - DataBase', () => {
  if (!useMocks) {
    beforeAll(async () => {
      const hashed = await bcrypt.hash(correctPassword, 10);
      await pool.query(INSERT_USER, [correctEmail, hashed]);
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

  if (!useMocks) {
    afterAll(async () => {
      await pool.query(DELETE_USER, [correctEmail]);
      await pool.end();
    });
  }

  it('✅ should fetch sync products', async () => {
    const res = await request(app).post(linkProductsSync).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', syncSuccess);
  });

  it('✅ should fetch remote products from FakeStoreAPI', async () => {
    const res = await request(app).get(linkProductsRemote).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      const product = res.body[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('title');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('category');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('image');
    }
  });

  it('✅ should fetch local products from DB', async () => {
    const res = await request(app).get(linkProductsLocal).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      const product = res.body[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('title');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('category');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('image');
    }
  });

  it('❌ should block local products request without token', async () => {
    const res = await request(app).get(linkProductsLocal);
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', noTokenProvided);
  });

  it('❌ should block remote products request without token', async () => {
    const res = await request(app).get(linkProductsRemote);
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', noTokenProvided);
  });

  it('❌ should block sync products request without token', async () => {
    const res = await request(app).post(linkProductsSync);
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', noTokenProvided);
  });
});
