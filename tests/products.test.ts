import request from 'supertest';
import app from 'src/app';
import { pool } from 'src/config/db';
import bcrypt from 'bcrypt';
import { noTokenProvided } from 'src/consts/tsoa';
import {
  linkProductsRemote,
  linkProductsLocal,
  DELETE_USER,
  INSERT_USER,
  correctEmail,
  correctPassword,
  linkLogin,
} from './consts';

let token: string;

describe('Products API - DataBase', () => {
  beforeAll(async () => {
    const hashed = await bcrypt.hash(correctPassword, 10);
    await pool.query(INSERT_USER, [correctEmail, hashed]);
  });

  beforeEach(async () => {
    const res = await request(app)
      .post(linkLogin)
      .send({ email: correctEmail, password: correctPassword });

    token = res.body.token || res.body?.data?.token;
    if (!token) {
      throw new Error('Token not received, check login credentials');
    }
  });

  afterAll(async () => {
    await pool.query(DELETE_USER, [correctEmail]);
    await pool.end();
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
});
