export const orderCreated = 'Order created';
export const dbMessage = 'Products synced to DB';
export const syncFailedMessage = 'Sync failed';
export const customer = 'The "customer" field is required and must be a string';
export const total = 'Total must be a number greater than 0';
export const items = 'Product list is required';
export const productId = 'Product ID must be an integer greater than 0';
export const quantity = 'Quantity must be an integer greater than 0';
export const idInfo = 'ID must be an integer greater than 0';

export const INSERT_ORDER = 'INSERT INTO orders (customer, total) VALUES ($1, $2) RETURNING id';
export const INSERT_ORDER_ITEM =
  'INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)';
export const SELECT_ORDER = 'SELECT * FROM orders ORDER BY id DESC';
