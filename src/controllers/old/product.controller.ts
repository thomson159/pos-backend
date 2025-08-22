// import { NextFunction, Request } from 'express';
// import axios from 'axios';
// import { pool } from '../config/db';
// import { INSERT_PRODUCT, dbMessage, syncFailedMessage, SELECT_PRODUCT, url } from 'src/consts';
// import {
//   ProductListResponse,
//   Product,
//   ProductPromiseType,
//   ProductResponseType,
//   SyncPromiseType,
//   SyncResponseType,
//   SyncSuccessResponse,
//   AppError,
// } from 'src/consts/types';

// export const getRemoteProducts = async (
//   _req: Request,
//   res: ProductResponseType,
//   next: NextFunction,
// ): ProductPromiseType => {
//   try {
//     const { data } = await axios.get<ProductListResponse>(url);

//     return res.json(data);
//   } catch (err) {
//     next(err);
//   }
// };

// export const getLocalProducts = async (
//   _req: Request,
//   res: ProductResponseType,
//   next: NextFunction,
// ): ProductPromiseType => {
//   try {
//     const result = await pool.query<Product>(SELECT_PRODUCT);
//     const products: ProductListResponse = result.rows;

//     return res.json(products);
//   } catch (err) {
//     next(err);
//   }
// };

// export const syncProducts = async (
//   _req: Request,
//   res: SyncResponseType,
//   next: NextFunction,
// ): SyncPromiseType => {
//   try {
//     const { data } = await axios.get<ProductListResponse>(url);

//     for (const p of data) {
//       await pool.query(INSERT_PRODUCT, [
//         p.id,
//         p.title,
//         p.price,
//         p.category,
//         p.description,
//         p.image,
//       ]);
//     }
//     const response: SyncSuccessResponse = { message: dbMessage };

//     return res.json(response);
//   } catch (err) {
//     const error = err as AppError;
//     error.status = 500;
//     error.message = syncFailedMessage;
//     next(error);
//   }
// };
