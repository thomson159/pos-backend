# POS Backend – Technical Specification

## 1. Technology Stack

- Node.js 18+
- Express + TypeScript
- PostgreSQL 14+
- JWT (jsonwebtoken)
- Jest + Supertest (tests)
- TSOA + Swagger-jsdoc + Swagger UI
- Docker + docker-compose

## 3. Security

- JWT in the header `Authorization: Bearer <token>`.
- Passwords hashed with bcrypt.
- Helmet + CORS.
- express-validator for request validation.

## 4. Tests

- `login.test.ts` – login (valid / invalid data)
- `products.test.ts` – fetching and syncing products
- `orders.test.ts` – creating and fetching orders

## 5. Deployment

- Render / Railway (Node)
- Railway / Neon / Supabase (PostgreSQL)
- Environment variables in `.env` (PORT, DATABASE_URL, JWT_SECRET).
