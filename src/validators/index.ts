import { body, param, ValidationChain } from 'express-validator';
import { customer, idInfo, items, productId, quantity, total } from 'src/consts';

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
