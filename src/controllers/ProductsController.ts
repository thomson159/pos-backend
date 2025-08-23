import { Controller, Get, Route, Response, Security, SuccessResponse, Post } from 'tsoa';
import axios from 'axios';
import { pool } from '../config/db';
import { fakestoreapi, INSERT_PRODUCT, SELECT_PRODUCT, serverError, syncSuccess } from 'src/consts';
import { AppError } from 'src/helpers';

interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  description: string;
  image: string;
}

interface ProductErrorResponse {
  message: string;
}

type SyncSuccessResponse = {
  message: string;
};

@Route('products')
export class ProductsController extends Controller {
  @Get('remote')
  @Security('bearerAuth')
  @SuccessResponse(200)
  @Response<ProductErrorResponse>(500, serverError)
  public async getRemoteProducts(): Promise<Product[]> {
    try {
      const { data } = await axios.get<Product[]>(fakestoreapi);
      return data;
    } catch (err) {
      throw new AppError(500, serverError);
    }
  }

  @Get('local')
  @Security('bearerAuth')
  @SuccessResponse(200)
  @Response<ProductErrorResponse>(500, serverError)
  public async getLocalProducts(): Promise<Product[]> {
    try {
      const result = await pool.query<Product>(SELECT_PRODUCT);
      return result.rows;
    } catch (err) {
      throw new AppError(500, serverError);
    }
  }

  @Post('sync')
  @Security('bearerAuth')
  @SuccessResponse(200)
  @Response<ProductErrorResponse>(500, serverError)
  public async syncProducts(): Promise<SyncSuccessResponse> {
    try {
      const { data } = await axios.get<Product[]>(fakestoreapi);

      for (const p of data) {
        await pool.query(INSERT_PRODUCT, [
          p.id,
          p.title,
          p.price,
          p.category,
          p.description,
          p.image,
        ]);
      }

      return { message: syncSuccess };
    } catch (err) {
      throw new AppError(500, serverError);
    }
  }
}
