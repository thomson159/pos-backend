import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import { validateError } from 'src/consts';
import { ValidationErrorType } from 'src/consts/types';

function hasParam(err: ValidationError): err is ValidationErrorType {
  return typeof (err as ValidationErrorType).param === 'string';
}

export function validate(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: validateError,
      errors: errors.array().map((err) => {
        if (hasParam(err)) {
          return {
            field: err.param,
            message: err.msg,
          };
        }

        return {
          field: 'unknown',
          message: err.msg,
        };
      }),
    });
  }

  next();
}
