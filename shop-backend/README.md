# Shop API

This is the Express/MySQL API for the React shop. It runs separately from the Vite frontend.
All product, order-item, and order-total amounts are stored and interpreted as Indian rupees (INR).

## Setup

1. Install MySQL and create the schema by running `schema.sql`, then load the starter catalog with `seed.sql`.
2. Copy `.env.example` to `.env`, then set your MySQL credentials and a random `JWT_SECRET` of at least 32 characters.
3. Install dependencies with `npm.cmd --prefix shop-backend install` and `npm.cmd install` from the project root.
4. From the project root, run `npm.cmd run dev:all` in PowerShell to start the API and React app in one terminal. Press Ctrl+C to stop both.
5. The API listens on port 5000 and the frontend uses `http://localhost:5000` by default. Set `VITE_API_URL` in the frontend `.env` to override the API URL.

The database user needs permission to create the tables in `schema.sql`. Never commit `.env`.

## Routes

- `POST /api/auth/register` — create a customer account; accepts `{ "name", "email", "password" }`.
- `POST /api/auth/login` — returns a JWT and user object.
- `GET /api/auth/me` — returns the current account and role for a valid JWT.
- `GET /api/products` and `GET /api/products/:id` — public product listings/details.
- `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id` — seller-only product management.
- `POST /api/orders` — authenticated order placement; accepts customer name, email, address, and `{ "productId", "quantity" }` items. Prices and stock are checked by the server.
- `GET /api/orders/my` — authenticated user's order history.
- `GET /api/orders` — seller-only order list.
- `PATCH /api/orders/:id/complete` — seller-only completion action; completed orders remain in `orders` with status `Completed`.

Send protected requests with `Authorization: Bearer <token>`. New accounts are customers. Promote an account to seller in MySQL with `UPDATE users SET role = 'seller' WHERE email = 'seller@example.com';`, then log in again. Sellers can also shop and view their own orders. Run `seller-role-migration.sql` to add the seller role to an existing database and migrate existing admin accounts.
