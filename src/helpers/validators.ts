import { body, param, ValidationChain } from 'express-validator';

export const customer = 'The "customer" field is required and must be a string';
export const total = 'Total must be a number greater than 0';
export const items = 'Product list is required';
export const productId = 'Product ID must be an integer greater than 0';
export const quantity = 'Quantity must be an integer greater than 0';
export const idInfo = 'ID must be an integer greater than 0';

export const createOrderValidator: ValidationChain[] = [
  body('customer').isString().withMessage(customer),
  body('total').isFloat({ gt: 0 }).withMessage(total),
  body('items').isArray({ min: 1 }).withMessage(items),
  body('items.*.product_id').isInt({ min: 1 }).withMessage(productId),
  body('items.*.quantity').isInt({ min: 1 }).withMessage(quantity),
];

export const idParamValidator: ValidationChain[] = [
  param('id').isInt({ min: 1 }).withMessage(idInfo),
];
