import { Controller, Get, Route, Response, Security, SuccessResponse } from 'tsoa';
import axios from 'axios';
import { pool } from '../config/db';
import { AppError, fakestoreapi, SELECT_PRODUCT, serverError } from 'src/consts/tsoa';

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
}
