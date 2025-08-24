import {
  Route,
  Post,
  Controller,
  SuccessResponse,
  Response,
  Body,
  Example,
  FieldErrors,
} from 'tsoa';
import { pool } from '../config/db';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import { UserDb, invalidCredentials, SELECT_AUTH, serverError } from '../consts';
import { AppError } from '../helpers';
import { validationFailed } from '../helpers/validators';

export interface ErrorResponse400 {
  message: string; // validationFailed
  details: FieldErrors[];
}

export interface ErrorResponse401 {
  message: string; // invalidCredentials
  details: FieldErrors[];
}

export interface ErrorResponse500 {
  message: string; // serverError
  details: FieldErrors[];
}

interface LoginSuccess {
  token: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

@Route('auth')
export class AuthController extends Controller {
  @Post('login')
  @Example<LoginSuccess>({ token: '$2b$10$bzj9VHtKqTuah3kEqDgC4eEyqv7p0HDHS7L.UEBEZv1889YObizsi' })
  @SuccessResponse(200)
  @Response<ErrorResponse400>(400, validationFailed)
  @Response<ErrorResponse401>(401, invalidCredentials)
  @Response<ErrorResponse500>(500, serverError)
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
