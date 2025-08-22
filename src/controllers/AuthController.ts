import { Route, Post, Body, Response, Controller, SuccessResponse } from 'tsoa';
import { pool } from '../config/db';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';

// ✅ Typy jako interfejsy
export interface LoginSuccess {
  token: string;
}

export interface ErrorResponse {
  message: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface UserDb {
  id: number;
  email: string;
  password: string;
  role: string;
}

// stała query
const SELECT_AUTH = 'SELECT * FROM users WHERE email = $1';

// własny error
export class AppError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

@Route('auth')
export class AuthController extends Controller {
  @Post('login')
  @SuccessResponse<LoginSuccess>(200, 'Login success')
  @Response<ErrorResponse>(401, 'Invalid credentials')
  @Response<ErrorResponse>(500, 'Server error')
  public async login(@Body() body: LoginBody): Promise<LoginSuccess> {
    const { email, password } = body;

    try {
      const result = await pool.query<UserDb>(SELECT_AUTH, [email]);

      if (result.rows.length === 0) {
        throw new AppError(401, 'Invalid credentials');
      }

      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        throw new AppError(401, 'Invalid credentials');
      }

      const payload = { id: user.id, role: user.role };
      const options: SignOptions = {
        expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'],
      };

      const token = jwt.sign(payload, config.jwtSecret, options);

      return { token };
    } catch (err: any) {
      if (err instanceof AppError && err.status === 401) {
        throw err;
      }
      throw new AppError(500, 'A server error occurred');
    }
  }
}
