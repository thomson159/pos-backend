# POS Backend – PRD

## 1. Business Context

Anna runs a boutique with clothing and accessories. She needs a simple POS system that:

- Displays available products (imported from an external source – FakeStoreAPI).
- Allows synchronizing them into a local database.
- Enables creating orders and viewing sales history.

## 2. Product Goal

Provide a backend API with:

- Secure user login (JWT).
- Fetching products from FakeStoreAPI.
- Synchronizing products into PostgreSQL.
- Order handling (add, list).
- Documentation (Swagger) and unit tests.

## 3. MVP Scope

- Endpoint `/api/auth/login` – user login.
- Endpoint `/api/products/remote` – fetch from FakeStoreAPI (JWT).
- Endpoint `/api/products/sync` – save to DB (JWT).
- Endpoint `/api/products/local` – fetch from DB (JWT).
- Endpoint `/api/orders` – create and list orders (JWT).
- Swagger available under `/api-docs`.

## 4. Out of Scope

- New user registration.
- Online payments.
- Sales reports.
- Integrations with inventory systems.

## 5. Personas

- **Anna** – boutique owner, main user.
- **Salesperson** – employee handling orders in the store.

## 6. User Scenarios

1. Anna logs into the system → fetches products from FakeStoreAPI → saves them into the DB → creates an order for a customer.  
2. The salesperson browses local products → selects and adds them to an order → finalizes the sale.

## 7. Acceptance Criteria

- All endpoints protected by JWT (except `/auth/login`).
- Proper validation and error handling (400, 401, 404, 500).
- Swagger generates documentation consistent with the implementation.
- All tests pass (`npm run test`).

## 8. Success Metrics

- 100% of MVP use cases available and functional.
- Documentation is clear for new developers.
