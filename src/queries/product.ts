// import { Product } from 'src/consts/tsoa';
// import { pool } from '../config/db';

// export interface ProductQueryParams {
//   q?: string;
//   category?: string;
//   minPrice?: string;
//   maxPrice?: string;
//   sort?: 'price' | 'title' | 'category';
//   order?: 'asc' | 'desc';
//   limit?: string;
//   offset?: string;
// }

// export const getProductsWithFilters = async (params: ProductQueryParams): Promise<Product[]> => {
//   const { q, category, minPrice, maxPrice, sort, order, limit, offset } = params;

//   const conditions: string[] = [];
//   const values: any[] = [];

//   if (q) {
//     values.push(`%${q}%`);
//     conditions.push(`(title ILIKE $${values.length} OR description ILIKE $${values.length})`);
//   }

//   if (category) {
//     values.push(category);
//     conditions.push(`category = $${values.length}`);
//   }

//   if (minPrice !== undefined) {
//     values.push(Number(minPrice));
//     conditions.push(`price >= $${values.length}`);
//   }

//   if (maxPrice !== undefined) {
//     values.push(Number(maxPrice));
//     conditions.push(`price <= $${values.length}`);
//   }

//   let query = `SELECT * FROM products`;
//   if (conditions.length > 0) {
//     query += ` WHERE ${conditions.join(' AND ')}`;
//   }

//   const allowedSort = ['price', 'title', 'category'];
//   const allowedOrder = ['asc', 'desc'];

//   if (sort && allowedSort.includes(sort)) {
//     const dir =
//       order && allowedOrder.includes(order.toLowerCase() as 'asc' | 'desc')
//         ? order.toUpperCase()
//         : 'ASC';
//     query += ` ORDER BY ${sort} ${dir}`;
//   }

//   if (limit) {
//     values.push(Number(limit));
//     query += ` LIMIT $${values.length}`;
//   }

//   if (offset) {
//     values.push(Number(offset));
//     query += ` OFFSET $${values.length}`;
//   }

//   const result = await pool.query<Product>(query, values);

//   return result.rows;
// };
