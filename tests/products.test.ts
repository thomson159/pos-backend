import request from 'supertest';
import app from 'src/app';
import { pool } from 'src/config/db';
import { dbMessage, noTokenProvided } from 'src/consts';
import { Product } from 'src/consts/types';
import bcrypt from 'bcrypt';

let token: string;

const linkProductsRemote = '/products/remote';
const linkProductsLocal = '/products/local';

describe('Products API - DataBase', () => {
  // Tworzymy użytkownika testowego przed wszystkimi testami
  beforeAll(async () => {
    const hashed = await bcrypt.hash('test1234', 10);
    await pool.query(
      `
      INSERT INTO users (email, password, role)
      VALUES ($1, $2, 'admin')
      ON CONFLICT (email) DO NOTHING
    `,
      ['anna@posdemo.pl', hashed],
    );
  });

  // Logowanie przed każdym testem
  beforeEach(async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'anna@posdemo.pl', password: 'test1234' });

    token = res.body.token || res.body?.data?.token;
    if (!token) {
      console.log(res.body); // debug – co faktycznie zwraca endpoint
      throw new Error('Token not received, check login credentials');
    }
  });

  // Usuwamy testowego użytkownika po wszystkich testach
  afterAll(async () => {
    await pool.query(`DELETE FROM users WHERE email = $1`, ['anna@posdemo.pl']);
    await pool.end();
  });

  it('✅ should fetch remote products from FakeStoreAPI', async () => {
    const res = await request(app).get(linkProductsRemote).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      const product: Product = res.body[0];
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
      const product: Product = res.body[0];
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
