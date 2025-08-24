import { CreateOrder, OrderItem } from 'src/controllers/OrdersController';

export const customer = 'The "customer" field is required and must be a string (1–255 chars)';
export const total = 'Total must be a number greater than 0';
export const productId = 'Product ID must be an integer greater than 0';
export const quantity = 'Quantity must be an integer greater than 0';
export const items = 'Items must be a non-empty array';
export const duplicates = 'Items must not contain duplicate product IDs';
export const createdAt = 'The "created_at" field cannot be set manually';

export const validationFailed = 'Validation failed';

export function validateOrder(body: CreateOrder): {
  valid: boolean;
  errors: { property: string; message: string }[];
} {
  const errors: { property: string; message: string }[] = [];

  if (!body || typeof body !== 'object') {
    errors.push({ property: 'body', message: 'Request body must be an object' });
    return { valid: false, errors };
  }

  if (
    body.customer === undefined ||
    typeof body.customer !== 'string' ||
    !body.customer.trim() ||
    body.customer.length > 255
  ) {
    errors.push({
      property: 'customer',
      message: customer,
    });
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.push({
      property: 'items',
      message: items,
    });
  } else {
    const productIds = new Set<number>();

    body.items.forEach((item: OrderItem, index: number) => {
      if (!Number.isInteger(item.product_id) || item.product_id < 1) {
        errors.push({
          property: `items[${index}].product_id`,
          message: productId,
        });
      } else {
        if (productIds.has(item.product_id)) {
          errors.push({
            property: `items[${index}].product_id`,
            message: duplicates,
          });
        }
        productIds.add(item.product_id);
      }

      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        errors.push({
          property: `items[${index}].quantity`,
          message: quantity,
        });
      }
    });

    if (
      errors.filter((e) => e.property.startsWith('items')).length === 0 &&
      (typeof body.total !== 'number' || body.total <= 0)
    ) {
      errors.push({
        property: 'total',
        message: total,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}
