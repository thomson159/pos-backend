import { Request, Response, NextFunction } from 'express';
import { ValidateError } from '@tsoa/runtime';
import {
  foreignKeyViolation,
  invalidTextRepresentation,
  notNullViolation,
  PgError,
  requestError,
  serverError,
  uniqueViolation,
  validateError,
} from 'src/consts';
import { AppError } from 'src/helpers';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const pgErrorMap: Record<string, { status: number; message: string }> = {
    '23503': { status: 400, message: foreignKeyViolation },
    '23505': { status: 400, message: uniqueViolation },
    '23502': { status: 400, message: notNullViolation },
    '22P02': { status: 400, message: invalidTextRepresentation },
  };

  if (err instanceof ValidateError) {
    const details = Object.entries(err.fields).map(([key, value]) => ({
      property: key.replace(/^body\./, ''),
      constraints: { isValid: value.message },
      value: value.value,
    }));

    return res.status(400).json({
      success: false,
      message: validateError,
      details,
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
        .json({ success: false, message: mapping.message, details: pgErr.errors || [] });
    }
  }

  if (err instanceof AppError || (typeof err === 'object' && err !== null && 'status' in err)) {
    const appErr = err as AppError & { errors?: unknown[] };
    return res.status(appErr.status || 400).json({
      success: false,
      message: appErr.message || requestError,
      details: appErr.errors || [],
    });
  }

  const unknownErr = err as { errors?: unknown[] };
  res.status(500).json({
    success: false,
    message: serverError,
    details: unknownErr.errors || [],
  });
}
