import { NextFunction } from 'express';
import { pool } from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { invalidCredentials, SELECT_AUTH, serverError } from 'src/consts';
import {
  LoginBody,
  LoginRequestType,
  LoginResponseType,
  UserFromDB,
  LoginPromiseType,
  AppError,
} from 'src/consts/types';

export const login = async (
  req: LoginRequestType,
  res: LoginResponseType,
  next: NextFunction,
): LoginPromiseType => {
  const { email, password }: LoginBody = req.body;

  try {
    const result = await pool.query(SELECT_AUTH, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: invalidCredentials });
    }

    const user: UserFromDB = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: invalidCredentials });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, {
      expiresIn: '1h',
    });

    return res.status(200).json({ token });
  } catch (err) {
    const error = err as AppError;
    error.status = 500;
    error.message = serverError;
    next(error);
  }
};
