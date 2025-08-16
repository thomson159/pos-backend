import { Request, Response, NextFunction } from 'express';
import {
  foreignKeyViolation,
  uniqueViolation,
  notNullViolation,
  invalidTextRepresentation,
  noTokenProvided,
  requestError,
  serverError,
} from 'src/consts';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const pgErrorMap: Record<string, { status: number; message: string }> = {
    '23503': { status: 400, message: foreignKeyViolation },
    '23505': { status: 400, message: uniqueViolation },
    '23502': { status: 400, message: notNullViolation },
    '22P02': { status: 400, message: invalidTextRepresentation },
  };

  if (err.code && pgErrorMap[err.code]) {
    const { status, message } = pgErrorMap[err.code];
    return res.status(status).json({
      success: false,
      message,
    });
  }

  if (err.status === 401 && err.message === noTokenProvided) {
    return res.status(401).json({
      success: false,
      message: err.message,
    });
  }

  if (err.status) {
    return res.status(err.status).json({
      success: false,
      message: err.message || requestError,
    });
  }

  res.status(500).json({
    success: false,
    message: serverError,
  });
}
