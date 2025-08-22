// import { mockedToken, getUseMocks, wrongPass, correctEmail, correctPassword } from './consts';

// let pool: any;
// let bcrypt: any;
// let jwt: any;

// const useMocks = getUseMocks();

// if (useMocks) {
//   jest.mock('../src/config/db', () => ({
//     pool: {
//       query: jest.fn(),
//     },
//   }));

//   jest.mock('bcrypt', () => ({
//     compare: jest.fn(),
//     hash: jest.fn(),
//   }));

//   jest.mock('jsonwebtoken', () => ({
//     sign: jest.fn(),
//   }));
// }

// import { login } from '../src/controllers/auth.controller';
// import { pool as realPool } from '../src/config/db';
// import bcryptLib from 'bcrypt';
// import jwtLib from 'jsonwebtoken';
// import { AppError, LoginRequestType, LoginResponseType } from 'src/consts/types';
// import { invalidCredentials, serverError } from 'src/consts';

// pool = useMocks ? require('../src/config/db').pool : realPool;
// bcrypt = useMocks ? require('bcrypt') : bcryptLib;
// jwt = useMocks ? require('jsonwebtoken') : jwtLib;

// describe('login', () => {
//   if (!useMocks) {
//     beforeAll(async () => {
//       const hashed = await bcrypt.hash(correctPassword, 10);
//       await pool.query(
//         `
//         INSERT INTO users (email, password)
//         VALUES ($1, $2)
//         ON CONFLICT (email) DO NOTHING
//       `,
//         [correctEmail, hashed],
//       );
//     });

//     afterAll(async () => {
//       await pool.query(`DELETE FROM users WHERE email = $1`, [correctEmail]);
//       await pool.end();
//     });
//   }

//   it('✅ should return token when credentials are correct', async () => {
//     if (useMocks) {
//       const mockUser = {
//         id: 1,
//         email: correctEmail,
//         password: correctPassword,
//       };

//       pool.query.mockResolvedValue({ rows: [mockUser] });
//       bcrypt.compare.mockResolvedValue(true);
//       jwt.sign.mockReturnValue(mockedToken);
//     }

//     const req = {
//       body: {
//         email: correctEmail,
//         password: correctPassword,
//       },
//     } as LoginRequestType;

//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     } as unknown as LoginResponseType;

//     const next = jest.fn();

//     await login(req, res, next);

//     if (useMocks) {
//       expect(pool.query).toHaveBeenCalledWith(expect.any(String), [correctEmail]);
//       expect(res.status).toHaveBeenCalledWith(200);
//       expect(res.json).toHaveBeenCalledWith({ token: mockedToken });
//     } else {
//       expect(res.status).toHaveBeenCalledWith(200);
//       const jsonMock = res.json as jest.Mock;
//       expect(jsonMock.mock.calls[0][0]).toHaveProperty('token');
//     }
//   });

//   it('❌ should reject login when password is incorrect', async () => {
//     if (useMocks) {
//       const mockUser = {
//         id: 1,
//         email: correctEmail,
//         password: correctPassword,
//       };

//       pool.query.mockResolvedValue({ rows: [mockUser] });
//       bcrypt.compare.mockResolvedValue(false);
//     }

//     const req = {
//       body: {
//         email: correctEmail,
//         password: wrongPass,
//       },
//     } as LoginRequestType;

//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     } as unknown as LoginResponseType;

//     const next = jest.fn();

//     await login(req, res, next);

//     if (useMocks) {
//       expect(pool.query).toHaveBeenCalledWith(expect.any(String), [correctEmail]);
//       expect(bcrypt.compare).toHaveBeenCalledWith(wrongPass, correctPassword);
//     }

//     expect(res.status).toHaveBeenCalledWith(401);
//     expect(res.json).toHaveBeenCalledWith({ message: invalidCredentials });
//   });

//   it('❌ should call next with 500 error when pool.query throws', async () => {
//     if (!useMocks) return;

//     const fakeError = new Error('Database failure');
//     pool.query.mockRejectedValue(fakeError);

//     const req = {
//       body: {
//         email: correctEmail,
//         password: correctPassword,
//       },
//     } as LoginRequestType;

//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     } as unknown as LoginResponseType;

//     const next = jest.fn();

//     await login(req, res, next);

//     expect(next).toHaveBeenCalledWith(
//       expect.objectContaining({
//         status: 500,
//         message: serverError,
//       }),
//     );

//     const passedError = next.mock.calls[0][0] as AppError;
//     expect(passedError.status).toBe(500);
//     expect(passedError.message).toBe(serverError);
//   });
// });
