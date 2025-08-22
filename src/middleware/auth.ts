import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { invalidTokenMessage, noTokenProvided } from 'src/consts';
import { AuthenticatedRequest, TokenPayload } from 'src/consts/types';

class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function expressAuthentication(
  req: AuthenticatedRequest,
  securityName: string,
  scopes?: string[],
  res?: Response,
): Promise<any> {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HttpError(noTokenProvided, 401);
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;
    req.user = decoded;
    return decoded;
  } catch {
    throw new HttpError(invalidTokenMessage, 401);
  }
}
