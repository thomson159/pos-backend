import { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';

export const fakestoreapi = 'https://fakestoreapi.com/products';

export const invalidCredentials = 'Invalid credentials';
export const invalidTokenMessage = 'Invalid token';
export const noTokenProvided = 'No token provided';
export const validateError = 'Validation errors';
export const requestError = 'Request error';
export const serverError = 'A server error occurred';
export const foreignKeyViolation =
  'The related record does not exist. Check the product, user, or other resource ID.';
export const uniqueViolation = 'The provided value must be unique. This record already exists.';
export const notNullViolation = 'A required value is missing in one of the fields.';
export const invalidTextRepresentation = 'Invalid value format provided (e.g. ID).';

export const SELECT_AUTH = 'SELECT * FROM users WHERE email = $1';
export const SELECT_PRODUCT = 'SELECT * FROM products';

export interface UserDb {
  id: number;
  email: string;
  password: string;
  role: string;
}

export class AppError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface TokenPayload extends JwtPayload {
  id: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export type PgError = {
  code: string;
  errors?: unknown[];
  [key: string]: unknown;
};
