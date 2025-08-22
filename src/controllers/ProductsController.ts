import { Controller, Get, Route, Response, Security, SuccessResponse } from 'tsoa';
import axios from 'axios';
import { pool } from '../config/db';
import { AppError, ErrorResponse } from './AuthController';

export const SELECT_PRODUCT = 'SELECT * FROM products';
export const url = 'https://fakestoreapi.com/products';

export interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  description: string;
  image: string;
}

@Route('products')
export class ProductsController extends Controller {
  @Get('remote')
  @Security('bearerAuth')
  @SuccessResponse(200, 'Products fetched from remote API')
  @Response<ErrorResponse>(500, 'Failed to fetch remote products')
  public async getRemoteProducts(): Promise<Product[]> {
    try {
      const { data } = await axios.get<Product[]>(url);
      return data;
    } catch (err) {
      throw new AppError(500, 'Failed to fetch remote products');
    }
  }

  @Get('local')
  @Security('bearerAuth')
  @SuccessResponse(200, 'Products fetched from remote API')
  @Response<ErrorResponse>(500, 'Failed to fetch local products')
  public async getLocalProducts(): Promise<Product[]> {
    try {
      const result = await pool.query<Product>(SELECT_PRODUCT);
      return result.rows;
    } catch (err) {
      throw new AppError(500, 'Failed to fetch local products');
    }
  }
}
