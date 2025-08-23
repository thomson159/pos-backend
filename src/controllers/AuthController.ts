import { Route, Post, Body, Response, Controller, SuccessResponse } from 'tsoa';
import { pool } from '../config/db';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import { UserDb, invalidCredentials, SELECT_AUTH, serverError } from 'src/consts';
import { AppError } from 'src/helpers';

export interface ErrorResponse {
  message: string;
}

interface LoginSuccess {
  token: string;
}

interface LoginBody {
  email: string;
  password: string;
}

@Route('auth')
export class AuthController extends Controller {
  @Post('login')
  @SuccessResponse(200)
  @Response<ErrorResponse>(401, invalidCredentials)
  @Response<ErrorResponse>(500, serverError)
  public async login(@Body() body: LoginBody): Promise<LoginSuccess> {
    const { email, password } = body;

    try {
      const result = await pool.query<UserDb>(SELECT_AUTH, [email]);

      if (result.rows.length === 0) {
        throw new AppError(401, invalidCredentials);
      }

      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        throw new AppError(401, invalidCredentials);
      }

      const payload = { id: user.id, role: user.role };
      const options: SignOptions = {
        expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'],
      };

      const token = jwt.sign(payload, config.jwtSecret, options);

      return { token };
    } catch (err: unknown) {
      if (err instanceof AppError && err.status === 401) {
        throw err;
      }
      throw new AppError(500, serverError);
    }
  }
}
