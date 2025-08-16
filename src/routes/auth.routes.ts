import { Router } from 'express';
import { login } from '../controllers/auth.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Logowanie i autoryzacja użytkownika
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Logowanie użytkownika
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: anna@posdemo.pl
 *               password:
 *                 type: string
 *                 example: test1234
 *     responses:
 *       200:
 *         description: Zalogowano pomyślnie
 *       401:
 *         description: Błędne dane logowania
 */

router.post('/login', login);

export default router;
