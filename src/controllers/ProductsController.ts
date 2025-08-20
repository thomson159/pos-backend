// import { Controller, Get, Post, Route, Response, Tags, Security } from 'tsoa';
// import axios from 'axios';
// import { pool } from '../config/db';
// import { INSERT_PRODUCT, dbMessage, syncFailedMessage, SELECT_PRODUCT, url } from '../consts';
// import type { SyncSuccessResponse, AppError } from '../consts/types';
// import { Product } from '../models/Product';

// @Route('products')
// @Tags('Products')
// export class ProductsController extends Controller {
//   @Get('remote')
//   @Security('bearerAuth')
//   @Response<500>(500, 'Internal Server Error')
//   public async getRemoteProducts(): Promise<Product[]> {
//     try {
//       const { data } = await axios.get<Product[]>(url);
//       return data;
//     } catch (err) {
//       throw { status: 500, message: 'Failed to fetch remote products' } as AppError;
//     }
//   }

//   @Get('local')
//   @Security('bearerAuth')
//   @Response<500>(500, 'Internal Server Error')
//   public async getLocalProducts(): Promise<Product[]> {
//     try {
//       const result = await pool.query<Product>(SELECT_PRODUCT);
//       return result.rows;
//     } catch (err) {
//       throw { status: 500, message: 'Failed to fetch local products' } as AppError;
//     }
//   }

//   @Post('sync')
//   @Security('bearerAuth')
//   @Response<500>(500, 'Internal Server Error')
//   public async syncProducts(): Promise<SyncSuccessResponse> {
//     try {
//       const { data } = await axios.get<Product[]>(url);

//       for (const p of data) {
//         await pool.query(INSERT_PRODUCT, [
//           p.id,
//           p.title,
//           p.price,
//           p.category,
//           p.description,
//           p.image,
//         ]);
//       }

//       return { message: dbMessage };
//     } catch (err) {
//       throw { status: 500, message: syncFailedMessage } as AppError;
//     }
//   }
// }
