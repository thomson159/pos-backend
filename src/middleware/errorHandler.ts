import { Request, Response, NextFunction } from 'express';
import { ValidateError } from '@tsoa/runtime';
import {
  AppError,
  foreignKeyViolation,
  invalidTextRepresentation,
  notNullViolation,
  PgError,
  requestError,
  serverError,
  uniqueViolation,
} from 'src/consts/tsoa';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
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

  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    typeof (err as PgError).code === 'string'
  ) {
    const pgErr = err as PgError;
    const mapping = pgErrorMap[pgErr.code];
    if (mapping) {
      return res
        .status(mapping.status)
        .json({ success: false, message: mapping.message, errors: pgErr.errors || [] });
    }
  }

  if (err instanceof AppError || (typeof err === 'object' && err !== null && 'status' in err)) {
    const appErr = err as AppError & { errors?: unknown[] };
    return res.status(appErr.status || 400).json({
      success: false,
      message: appErr.message || requestError,
      errors: appErr.errors || [],
    });
  }

  const unknownErr = err as { errors?: unknown[] };
  res.status(500).json({
    success: false,
    message: serverError,
    errors: unknownErr.errors || [],
  });
}
