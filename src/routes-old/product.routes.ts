// import { Router } from 'express';
// import {
//   getRemoteProducts,
//   syncProducts,
//   getLocalProducts,
// } from '../controllers/product.controller';
// import { authenticate } from '../middleware/auth';

// const router = Router();

// /**
//  * @swagger
//  * tags:
//  *   name: Products
//  *   description: Zarządzanie produktami
//  */

// /**
//  * @swagger
//  * /products/remote:
//  *   get:
//  *     summary: Pobierz produkty z zewnętrznego API
//  *     tags: [Products]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Lista produktów zdalnych
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 type: object
//  *                 properties:
//  *                   id:
//  *                     type: integer
//  *                     example: 1
//  *                   name:
//  *                     type: string
//  *                     example: Produkt zdalny
//  *                   price:
//  *                     type: number
//  *                     example: 19.99
//  *                   description:
//  *                     type: string
//  *                     example: Opis produktu
//  *       401:
//  *         description: Brak autoryzacji
//  */

// /**
//  * @swagger
//  * /products/sync:
//  *   post:
//  *     summary: Synchronizuj produkty lokalne z zewnętrznymi
//  *     tags: [Products]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Produkty zostały zsynchronizowane
//  *       401:
//  *         description: Brak autoryzacji
//  *       500:
//  *         description: Błąd serwera
//  */

// /**
//  * @swagger
//  * /products/local:
//  *   get:
//  *     summary: Pobierz lokalne produkty z bazy danych
//  *     tags: [Products]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Lista lokalnych produktów
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 type: object
//  *                 properties:
//  *                   id:
//  *                     type: integer
//  *                     example: 1
//  *                   name:
//  *                     type: string
//  *                     example: Produkt lokalny
//  *                   price:
//  *                     type: number
//  *                     example: 29.99
//  *                   description:
//  *                     type: string
//  *                     example: Opis lokalnego produktu
//  *       401:
//  *         description: Brak autoryzacji
//  */

// router.get('/remote', authenticate, getRemoteProducts);
// router.post('/sync', authenticate, syncProducts);
// router.get('/local', authenticate, getLocalProducts);

// export default router;
