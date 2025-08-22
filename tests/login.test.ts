import { mockedToken, getUseMocks, wrongPass, correctEmail, correctPassword } from './consts';

let pool: any;
let bcrypt: any;
let jwt: any;

const useMocks = getUseMocks();

if (useMocks) {
  jest.mock('../src/config/db', () => ({
    pool: {
      query: jest.fn(),
    },
  }));

  jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
  }));

  jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
  }));
}

import { pool as realPool } from '../src/config/db';
import bcryptLib from 'bcrypt';
import jwtLib from 'jsonwebtoken';
import { invalidCredentials, serverError } from 'src/consts';
import { AuthController } from 'src/controllers/AuthController';

pool = useMocks ? require('../src/config/db').pool : realPool;
bcrypt = useMocks ? require('bcrypt') : bcryptLib;
jwt = useMocks ? require('jsonwebtoken') : jwtLib;

describe('AuthController.login', () => {
  const controller = new AuthController();

  if (!useMocks) {
    beforeAll(async () => {
      const hashed = await bcrypt.hash(correctPassword, 10);
      await pool.query(
        `
        INSERT INTO users (email, password)
        VALUES ($1, $2)
        ON CONFLICT (email) DO NOTHING
      `,
        [correctEmail, hashed],
      );
    });

    afterAll(async () => {
      await pool.query(`DELETE FROM users WHERE email = $1`, [correctEmail]);
      await pool.end();
    });
  }

  it('✅ should return token when credentials are correct', async () => {
    if (useMocks) {
      const mockUser = {
        id: 1,
        email: correctEmail,
        password: correctPassword,
        role: 'user',
      };

      pool.query.mockResolvedValue({ rows: [mockUser] });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue(mockedToken);
    }

    const result = await controller.login({
      email: correctEmail,
      password: correctPassword,
    });

    if (useMocks) {
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [correctEmail]);
      expect(result).toEqual({ token: mockedToken });
    } else {
      expect(result).toHaveProperty('token');
    }
  });

  it('❌ should reject login when password is incorrect', async () => {
    if (useMocks) {
      const mockUser = {
        id: 1,
        email: correctEmail,
        password: correctPassword,
        role: 'user',
      };

      pool.query.mockResolvedValue({ rows: [mockUser] });
      bcrypt.compare.mockResolvedValue(false);
    }

    await expect(
      controller.login({
        email: correctEmail,
        password: wrongPass,
      }),
    ).rejects.toMatchObject({
      status: 401,
      message: invalidCredentials,
    });

    if (useMocks) {
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [correctEmail]);
      expect(bcrypt.compare).toHaveBeenCalledWith(wrongPass, correctPassword);
    }
  });

  it('❌ should throw 500 error when pool.query fails', async () => {
    if (!useMocks) return;

    const fakeError = new Error('Database failure');
    pool.query.mockRejectedValue(fakeError);

    await expect(
      controller.login({
        email: correctEmail,
        password: correctPassword,
      }),
    ).rejects.toMatchObject({
      status: 500,
      message: serverError,
    });
  });
});
