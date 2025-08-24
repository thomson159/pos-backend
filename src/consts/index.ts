import { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';
import { OrderWithItems, CreateOrderSuccess } from '../controllers/OrdersController';
import { Product } from '../controllers/ProductsController';

export const fakestoreapi = 'https://fakestoreapi.com/products';

export const invalidCredentials = 'Invalid credentials';

export const invalidTokenMessage = 'Invalid token';
export const noTokenProvided = 'No token provided';

export const validateError = 'Validation errors';
export const requestError = 'Request error';
export const serverError = 'A server error occurred';
export const foreignKeyViolation =
  'The related record does not exist. Check the product, user, or other resource ID.';
export const uniqueViolation = 'The provided value must be unique. This record already exists.';
export const notNullViolation = 'A required value is missing in one of the fields.';
export const invalidTextRepresentation = 'Invalid value format provided (e.g. ID).';
export const syncSuccess = 'Sync Success';
export const orderCreated = 'Order created';

export const SELECT_AUTH = 'SELECT * FROM users WHERE email = $1';
export const SELECT_PRODUCT = 'SELECT * FROM products';
export const INSERT_PRODUCT = `INSERT INTO products (id, title, price, category, description, image) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`;
export const INSERT_ORDER = `
  INSERT INTO orders (customer, total) 
  VALUES ($1, $2) 
  RETURNING id
`;
export const INSERT_ORDER_ITEM = `
  INSERT INTO order_items (order_id, product_id, quantity) 
  VALUES ($1, $2, $3)
`;
export const SELECT_ORDER_WITH_ITEMS = `
  SELECT
    o.id,
    o.customer,
    o.total,
    o.created_at,
    oi.product_id,
    oi.quantity,
    p.title AS product_name,
    p.price AS product_price
  FROM orders o
  LEFT JOIN order_items oi ON o.id = oi.order_id
  LEFT JOIN products p ON oi.product_id = p.id
  ORDER BY o.id, oi.product_id;
`;
// export const SELECT_ORDER = 'SELECT * FROM orders ORDER BY id DESC';

export interface UserDb {
  id: number;
  email: string;
  password: string;
  role: string;
}

export interface TokenPayload extends JwtPayload {
  id: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export type PgError = {
  code: string;
  errors?: unknown[];
  [key: string]: unknown;
};

export const getProductsExample: Product[] = [
  {
    id: 1,
    title: 'Pen',
    price: 10,
    category: 'Standard',
    description: 'Super pen',
    image: 'pen',
  },
];

export const getOrderExample: OrderWithItems[] = [
  {
    id: 1,
    customer: 'John Doe',
    total: 150,
    created_at: '2025-08-22T12:34:56Z',
    items: [
      { product_id: 1, quantity: 2, product_name: 'Pen', product_price: 50 },
      { product_id: 2, quantity: 1, product_name: 'Notebook', product_price: 50 },
    ],
  },
  {
    id: 2,
    customer: 'John Doe',
    total: 150,
    created_at: '2025-08-22T12:34:56Z',
    items: [{ product_id: 3, quantity: 2, product_name: 'Book', product_price: 50 }],
  },
];

export const createOrderExample: CreateOrderSuccess = { message: orderCreated, orderId: 1 };
