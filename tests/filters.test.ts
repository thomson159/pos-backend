// // import { Request, Response, NextFunction } from 'express';
// import { pool } from 'src/config/db';
// // import { getLocalProducts } from 'src/controllers/old/product.controller';
// import { getProductsWithFilters } from 'src/queries/product';

// jest.mock('../src/config/db', () => ({
//   pool: {
//     query: jest.fn(),
//   },
// }));

// describe('getProductsWithFilters', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('✅ should return all products without filters', async () => {
//     const mockRows = [{ id: 1, title: 'Product 1', price: 10 }];
//     (pool.query as jest.Mock).mockResolvedValue({ rows: mockRows });

//     const result = await getProductsWithFilters({});
//     expect(pool.query).toHaveBeenCalledWith('SELECT * FROM products', []);
//     expect(result).toEqual(mockRows);
//   });

//   it('✅ should apply text query filter', async () => {
//     const mockRows = [{ id: 2, title: 'Test Product', price: 20 }];
//     (pool.query as jest.Mock).mockResolvedValue({ rows: mockRows });

//     const result = await getProductsWithFilters({ q: 'Test' });

//     expect(pool.query).toHaveBeenCalledWith(
//       expect.stringContaining('(title ILIKE $1 OR description ILIKE $1)'),
//       ['%Test%'],
//     );
//     expect(result).toEqual(mockRows);
//   });

//   it('✅ should apply category and price filters', async () => {
//     const mockRows = [{ id: 3, title: 'Product 3', price: 50, category: 'cat' }];
//     (pool.query as jest.Mock).mockResolvedValue({ rows: mockRows });

//     const result = await getProductsWithFilters({
//       category: 'cat',
//       minPrice: '30',
//       maxPrice: '100',
//     });

//     expect(pool.query).toHaveBeenCalledWith(
//       expect.stringContaining('category = $1 AND price >= $2 AND price <= $3'),
//       ['cat', 30, 100],
//     );
//     expect(result).toEqual(mockRows);
//   });

//   it('✅ should apply sorting and limit/offset', async () => {
//     const mockRows = [{ id: 4, title: 'Product 4', price: 40 }];
//     (pool.query as jest.Mock).mockResolvedValue({ rows: mockRows });

//     const result = await getProductsWithFilters({
//       sort: 'price',
//       order: 'desc',
//       limit: '10',
//       offset: '5',
//     });

//     expect(pool.query).toHaveBeenCalledWith(
//       expect.stringContaining('ORDER BY price DESC LIMIT $1 OFFSET $2'),
//       [10, 5],
//     );
//     expect(result).toEqual(mockRows);
//   });

//   it('✅ should ignore invalid sort and order', async () => {
//     const mockRows = [{ id: 5, title: 'Product 5', price: 50 }];
//     (pool.query as jest.Mock).mockResolvedValue({ rows: mockRows });

//     const result = await getProductsWithFilters({
//       sort: 'invalid' as any,
//       order: 'invalid' as any,
//     });

//     expect(pool.query).toHaveBeenCalledWith('SELECT * FROM products', []);
//     expect(result).toEqual(mockRows);
//   });
// });

// // describe('getLocalProducts', () => {
// //   let req: Partial<Request>;
// //   let res: Partial<Response>;
// //   let next: NextFunction;

// //   beforeEach(() => {
// //     jest.clearAllMocks();
// //     req = { query: {} };
// //     res = { json: jest.fn() };
// //     next = jest.fn();
// //   });

// //   it('✅ should return products using getProductsWithFilters', async () => {
// //     const mockRows = [{ id: 1, title: 'Product', price: 10 }];
// //     (pool.query as jest.Mock).mockResolvedValue({ rows: mockRows });
// //     req.query = { q: 'Test' };

// //     await getLocalProducts(req as Request, res as Response, next);

// //     expect(res.json).toHaveBeenCalledWith(mockRows);
// //     expect(next).not.toHaveBeenCalled();
// //   });

// //   it('❌ should call next with error if getProductsWithFilters throws', async () => {
// //     const error = new Error('DB error');
// //     (pool.query as jest.Mock).mockRejectedValue(error);

// //     await getLocalProducts(req as Request, res as Response, next);

// //     expect(next).toHaveBeenCalledWith(error);
// //     expect(res.json).not.toHaveBeenCalled();
// //   });
// // });
