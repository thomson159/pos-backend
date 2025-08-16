# POS Backend – Specyfikacja techniczna

## 1. Stack technologiczny

- Node.js 18+
- Express + TypeScript
- PostgreSQL 14+
- JWT (jsonwebtoken)
- Jest + Supertest (testy)
- Swagger-jsdoc + Swagger UI
- Docker + docker-compose

## 3. Bezpieczeństwo

- JWT w nagłówku `Authorization: Bearer <token>`.
- Hasła hashowane bcryptem.
- Helmet + CORS.
- express-validator dla walidacji requestów.

## 4. Testy

- `auth.test.ts` – logowanie (OK / błędne dane)
- `products.test.ts` – pobieranie i sync produktów
- `orders.test.ts` – tworzenie i pobieranie zamówień

## 5. Deploy

- Render / Railway (Node)
- Railway / Neon / Supabase (PostgreSQL)
- Zmienne środowiskowe w `.env` (PORT, DATABASE_URL, JWT_SECRET).

erDiagram
USERS ||--o{ ORDERS : "creates"
ORDERS ||--o{ ORDER_ITEMS : "has"
PRODUCTS ||--o{ ORDER_ITEMS : "referenced in"

    USERS {
      int id PK
      string email UK
      string password
      string role
      timestamp created_at
    }

    PRODUCTS {
      int id PK
      string title
      decimal price
      string category
      string description
      string image
      timestamp created_at
    }

    ORDERS {
      int id PK
      string customer
      decimal total
      timestamp created_at
    }

    ORDER_ITEMS {
      int id PK
      int order_id FK
      int product_id FK
      int quantity
    }
