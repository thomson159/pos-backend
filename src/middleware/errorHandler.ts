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
} from '../consts';
import { AppError } from '../helpers';

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
      message: value.message,
    }));

    return res.status(400).json({
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
        .json({ message: mapping.message, details: pgErr.errors || [] });
    }
  }

  if (err instanceof AppError || (typeof err === 'object' && err !== null && 'status' in err)) {
    const appErr = err as AppError & { errors?: unknown[] };
    const details =
      Array.isArray(appErr.errors) && appErr.errors.length > 0
        ? appErr.errors.map((e) => ({
            property: (e as { property: string; message: string }).property,
            message: (e as { property: string; message: string }).message,
          }))
        : [];
    return res.status(appErr.status || 400).json({
      message: appErr.message || requestError,
      details,
    });
  }

  const unknownErr = err as { errors?: unknown[] };
  res.status(500).json({
    message: serverError,
    details: unknownErr.errors || [],
  });
}
