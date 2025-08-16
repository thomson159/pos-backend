export const url = 'https://fakestoreapi.com/products';

// validation and database error messages
export const orderCreated = 'Order created';
export const foreignKeyViolation = 'The related record does not exist. Check the product, user, or other resource ID.';
export const uniqueViolation = 'The provided value must be unique. This record already exists.';
export const notNullViolation = 'A required value is missing in one of the fields.';
export const invalidTextRepresentation = 'Invalid value format provided (e.g. ID).';
export const invalidTokenMessage = 'Invalid token';
export const noTokenProvided = 'No token provided';
export const requestError = 'Request error';
export const serverError = 'A server error occurred';
export const invalidCredentials = 'Invalid credentials';
export const validateError = 'Validation errors';
export const dbMessage = 'Products synced to DB';
export const syncFailedMessage = 'Sync failed';
export const customer = 'The "customer" field is required and must be a string';
export const total = 'Total must be a number greater than 0';
export const items = 'Product list is required';
export const productId = 'Product ID must be an integer greater than 0';
export const quantity = 'Quantity must be an integer greater than 0';
export const idInfo = 'ID must be an integer greater than 0';

// database-related strings
export const error = 'Database query error:';
export const user = 'Users in the database:';

// SQL queries
export const SELECT_USERS = 'SELECT * FROM users';
export const INSERT_PRODUCT = `INSERT INTO products (id, title, price, category, description, image) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`;
export const SELECT_PRODUCT = 'SELECT * FROM products';
export const INSERT_ORDER = 'INSERT INTO orders (customer, total) VALUES ($1, $2) RETURNING id';
export const INSERT_ORDER_ITEM = 'INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)';
export const SELECT_ORDER = 'SELECT * FROM orders ORDER BY id DESC';
export const SELECT_AUTH = 'SELECT * FROM users WHERE email = $1';
