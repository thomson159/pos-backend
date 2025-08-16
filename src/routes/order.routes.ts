import { Router } from 'express';
import { createOrder, getOrders } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth';
import { createOrderValidator } from 'src/validators';
import { validate } from 'src/middleware/validate';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Zarządzanie zamówieniami
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Utwórz nowe zamówienie
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer
 *               - total
 *               - items
 *             properties:
 *               customer:
 *                 type: string
 *                 example: Jan Kowalski
 *               total:
 *                 type: number
 *                 example: 99.99
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_id
 *                     - quantity
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       200:
 *         description: Zamówienie zostało utworzone
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: integer
 *                   example: 123
 *       401:
 *         description: Brak autoryzacji
 *       500:
 *         description: Błąd serwera
 *
 *   get:
 *     summary: Pobierz listę zamówień użytkownika
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista zamówień
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   orderId:
 *                     type: integer
 *                     example: 123
 *                   customer:
 *                     type: string
 *                     example: Jan Kowalski
 *                   total:
 *                     type: number
 *                     example: 99.99
 *                   items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         product_id:
 *                           type: integer
 *                           example: 1
 *                         quantity:
 *                           type: integer
 *                           example: 2
 *       401:
 *         description: Brak autoryzacji
 *       500:
 *         description: Błąd serwera
 */

router.post('/', authenticate, createOrderValidator, validate, createOrder);
router.get('/', authenticate, getOrders);

export default router;
