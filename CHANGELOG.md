# Changelog

## [1.0.0] – 2025-08-14

### Added

- Endpoint `/api/auth/login` with JWT.
- Endpoint `/api/products/remote` to fetch products from FakeStoreAPI.
- Endpoint `/api/products/sync` to save products into the DB.
- Endpoint `/api/products/local` to fetch products from the DB.
- Endpoint `/api/orders` to create and list orders.
- Middleware `authenticate` for JWT verification.
- Swagger configuration and OpenAPI documentation.
- Unit tests (auth, products, orders).
- Config files: `.env.example`, `docker-compose.yml`, `schema.sql`.

### Changed

- Project structure to controllers/services/routes/config/utils.

### Fixed

- Error handling when token is missing (401 Unauthorized).
