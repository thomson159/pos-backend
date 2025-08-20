// import { Route, Tags, Post, Body, SuccessResponse, Response, Controller } from 'tsoa';
// import { pool } from '../config/db';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import { config } from '../config/env';
// import { invalidCredentials, SELECT_AUTH, serverError } from 'src/consts';
// import type { LoginBody, UserFromDB } from '../consts/types';

// @Route('auth')
// @Tags('Auth')
// export class AuthController extends Controller {
//   @Post('login')
//   @SuccessResponse('200', 'Zalogowano pomyślnie')
//   @Response<{ message: string }>(401, 'Nieprawidłowe dane logowania')
//   @Response<{ message: string }>(500, 'Błąd serwera')
//   public async login(@Body() body: LoginBody): Promise<{ token?: string; message?: string }> {
//     const { email, password } = body;

//     try {
//       const result = await pool.query(SELECT_AUTH, [email]);

//       if (result.rows.length === 0) {
//         this.setStatus(401);
//         return { message: invalidCredentials };
//       }

//       const user: UserFromDB = result.rows[0];
//       const isMatch = await bcrypt.compare(password, user.password);

//       if (!isMatch) {
//         this.setStatus(401);
//         return { message: invalidCredentials };
//       }

//       const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, {
//         expiresIn: '1h',
//       });

//       return { token };
//     } catch (err) {
//       this.setStatus(500);
//       return { message: serverError };
//     }
//   }
// }
