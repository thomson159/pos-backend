# POS Backend – PRD

## 1. Kontekst biznesowy

Anna prowadzi butik z odzieżą i akcesoriami. Potrzebuje prostego systemu POS, który:

- Pokaże dostępne produkty (import z zewnętrznego źródła – FakeStoreAPI).
- Pozwoli zsynchronizować je do lokalnej bazy.
- Umożliwi tworzenie zamówień i przeglądanie historii sprzedaży.

## 2. Cel produktu

Zapewnić backend API z:

- Bezpiecznym logowaniem użytkownika (JWT).
- Pobieraniem produktów z FakeStoreAPI.
- Synchronizacją produktów do PostgreSQL.
- Obsługą zamówień (dodawanie, lista).
- Dokumentacją (Swagger) i testami jednostkowymi.

## 3. Zakres MVP

- Endpoint `/api/auth/login` – logowanie użytkownika.
- Endpoint `/api/products/remote` – pobranie z FakeStoreAPI (JWT).
- Endpoint `/api/products/sync` – zapis do DB (JWT).
- Endpoint `/api/products/local` – produkty z DB (JWT).
- Endpoint `/api/orders` – tworzenie i lista zamówień (JWT).
- Swagger pod `/api-docs`.

## 4. Poza zakresem MVP

- Rejestracja nowych użytkowników.
- Płatności online.
- Raporty sprzedaży.
- Integracje z systemami magazynowymi.

## 5. Persony

- **Anna** – właścicielka butiku, główny użytkownik.
- **Sprzedawca** – pracownik obsługujący zamówienia w sklepie.

## 6. Scenariusze użytkownika

1. Anna loguje się do systemu → pobiera produkty z FakeStoreAPI → zapisuje do DB → tworzy zamówienie dla klienta.
2. Sprzedawca przegląda lokalne produkty → wybiera i dodaje do zamówienia → finalizuje sprzedaż.

## 7. Kryteria akceptacji

- Wszystkie endpointy chronione JWT (poza `/auth/login`).
- Poprawne walidacje i obsługa błędów (400, 401, 404, 500).
- Swagger generuje dokumentację zgodną z implementacją.
- Testy przechodzą na zielono (`npm run test`).

## 8. Metryki sukcesu

- 100% przypadków użycia MVP dostępne i działające.
- Dokumentacja czytelna dla nowych developerów.
