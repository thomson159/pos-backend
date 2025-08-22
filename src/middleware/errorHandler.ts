import { Request, Response, NextFunction } from 'express';
import { ValidateError } from '@tsoa/runtime';
import {
  foreignKeyViolation,
  uniqueViolation,
  notNullViolation,
  invalidTextRepresentation,
  requestError,
  serverError,
} from 'src/consts';
import { AppError } from 'src/controllers/AuthController';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const pgErrorMap: Record<string, { status: number; message: string }> = {
    '23503': { status: 400, message: foreignKeyViolation },
    '23505': { status: 400, message: uniqueViolation },
    '23502': { status: 400, message: notNullViolation },
    '22P02': { status: 400, message: invalidTextRepresentation },
  };

  if (err instanceof ValidateError) {
    return res.status(400).json({
      success: false,
      message: 'Validation Failed',
      errors: err.fields,
    });
  }

  if (err.code && pgErrorMap[err.code]) {
    const { status, message } = pgErrorMap[err.code];
    return res.status(status).json({ success: false, message, errors: err.errors || [] });
  }

  if (err instanceof AppError || err.status) {
    return res.status(err.status || 400).json({
      success: false,
      message: err.message || requestError,
      errors: err.errors || [],
    });
  }

  res.status(500).json({
    success: false,
    message: serverError,
    errors: err.errors || [],
  });
}
