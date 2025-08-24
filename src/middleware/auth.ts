import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import {
  noTokenProvided,
  invalidTokenMessage,
  TokenPayload,
  AuthenticatedRequest,
} from '../consts';
import { HttpError } from '../helpers';

export async function expressAuthentication(
  req: AuthenticatedRequest,
  securityName: string,
  scopes?: string[],
  res?: Response,
): Promise<TokenPayload> {
  const authHeader = req.headers['authorization'] as string | undefined;

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
