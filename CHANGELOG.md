# Changelog

## [1.0.0] – 2025-08-14

### Dodane

- Endpoint `/api/auth/login` z JWT.
- Endpoint `/api/products/remote` do pobrania produktów z FakeStoreAPI.
- Endpoint `/api/products/sync` do zapisu produktów w DB.
- Endpoint `/api/products/local` do pobierania produktów z DB.
- Endpoint `/api/orders` do tworzenia i listowania zamówień.
- Middleware `authenticate` do weryfikacji JWT.
- Konfiguracja Swaggera i dokumentacja OpenAPI.
- Testy jednostkowe (auth, products, orders).
- Pliki konfiguracyjne: `.env.example`, `docker-compose.yml`, `schema.sql`.

### Zmienione

- Struktura projektu na controllers/services/routes/config/utils.

### Naprawione

- Obsługa błędów przy braku tokena (401 Unauthorized).
