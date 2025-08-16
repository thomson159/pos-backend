import {
  mockedToken,
  getUseMocks,
  wrongEmail,
  wrongPass,
  correctEmail,
  correctPassword,
  linkLogin,
} from './consts';

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
}

import { NextFunction } from 'express';
import app from 'src/app';
import { invalidCredentials } from 'src/consts';
import request from 'supertest';

describe('Auth API - DataBase', () => {
  it('✅ should login with correct credentials', async () => {
    const res = await request(app)
      .post(linkLogin)
      .send({ email: correctEmail, password: correctPassword });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('❌ should reject invalid password', async () => {
    const res = await request(app)
      .post(linkLogin)
      .send({ email: correctEmail, password: wrongPass });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', invalidCredentials);
  });

  it('❌ should reject invalid email', async () => {
    const res = await request(app)
      .post(linkLogin)
      .send({ email: wrongEmail, password: correctPassword });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', invalidCredentials);
  });
});
