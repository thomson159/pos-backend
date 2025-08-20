// // import { Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import { config } from '../config/env';
// // import { invalidTokenMessage, noTokenProvided } from 'src/consts';
// import { AuthenticatedRequest, TokenPayload } from 'src/consts/types';

// class HttpError extends Error {
//   status: number;

//   constructor(message: string, status: number) {
//     super(message);
//     this.status = status;
//   }
// }

// export async function expressAuthentication(
//   request: AuthenticatedRequest,
//   securityName: string,
//   scopes?: string[],
// ): Promise<any> {
//   const authHeader = request.headers['authorization'];

//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     throw new Error('No token provided');
//   }

//   const token = authHeader.slice(7);
//   try {
//     const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;
//     return decoded;
//   } catch {
//     throw new Error('Invalid token');
//   }
// }
