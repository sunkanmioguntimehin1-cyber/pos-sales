# POS Backend

Express + Mongoose REST API for the point-of-sale app.

> This document describes the routes that **actually exist** in
> `src/routes/`. There are no `/api/admin/*`, superadmin, or multi-tenant
> endpoints — see [Not implemented](#not-implemented).

## Requirements

- Node.js 18+ (developed on 22.x)
- A MongoDB Atlas connection string. For offline development only, a running
  server with no `MONGODB_URI` will start a throwaway in-memory MongoDB instead
  (see [Database](#database)).

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

### Environment variables

| Variable          | Default             | Notes                                                                    |
| ----------------- | ------------------- | ------------------------------------------------------------------------ |
| `PORT`            | `5000`              | Local dev uses `5001` because macOS AirPlay Receiver holds `5000`.        |
| `MONGODB_URI`     | _empty_             | Atlas connection string. If set, the server **refuses to start** on failure. |
| `USE_MEMORY_DB`   | `false`             | Set `true` to force the in-memory database.                               |
| `FRONTEND_URL`    | _empty_             | Comma-separated list of allowed CORS origins.                             |
| `JWT_SECRET`      | _empty_             | **Required for a real deployment.**                                      |
| `ADMIN_EMAIL`     | `admin@example.com` | Email of the seeded admin. The seed is keyed on this, not on role.       |
| `ADMIN_PASSWORD`  | `password`          | Password of the seeded admin. **Change before your first run.** Applied only at creation. |
| `ADMIN_NAME`      | `Admin`             | Display name for the seeded admin.                                        |
| `NODE_ENV`        | `dev`               |                                                                          |

## Running

```bash
npm run dev          # nodemon
npm run dev:memory   # forces the in-memory MongoDB (MONGODB_URI=)
npm start            # production
```

Or use the repo-root helper, which starts it in the background, waits for
`/api/health`, and writes a log + pidfile:

```bash
./scripts/dev-backend.sh          # start
./scripts/dev-backend-stop.sh     # stop
```

Logs go to `/tmp/pos-backend.log`, pid to `/tmp/pos-backend.pid`.

On start the server seeds an admin account from `ADMIN_EMAIL`, `ADMIN_PASSWORD`
and `ADMIN_NAME` in `.env` (see the table above). **Set a real password before
the first run** — otherwise the weak built-in default is created permanently in
your database.

The seed is keyed on the **email**, not on `role: 'admin'`, and it only ever
*creates*:

- Change `ADMIN_EMAIL` and restart → a new admin is created for that address.
- Change `ADMIN_PASSWORD` and restart → **nothing happens.** The password is
  only ever set at creation, so restarting can never revert a password you
  changed through the Staff screen. Reset the account via `PUT /api/staff/:id`
  instead.

So `.env` is authoritative for a *fresh* database only. Once the account
exists, treat it as a normal staff record managed through `/api/staff`.

To re-run the seed from scratch, delete the staff record first:

```bash
TOKEN=$(curl -s -X POST localhost:5001/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"<current password>"}' | jq -r .token)
curl -s localhost:5001/api/staff -H "Authorization: Bearer $TOKEN"   # find the id
curl -s -X DELETE localhost:5001/api/staff/<id> -H "Authorization: Bearer $TOKEN"
```

## Database

This project uses **MongoDB Atlas**. Set `MONGODB_URI` in `.env` and it is used.

`src/config/db.js` picks the database in this order:

1. `USE_MEMORY_DB=true` → start an ephemeral `mongodb-memory-server`, ignoring
   `MONGODB_URI`.
2. `MONGODB_URI` empty → start an ephemeral `mongodb-memory-server`.
3. Otherwise → connect to `MONGODB_URI`. **If that fails the process exits with a
   non-zero status** and prints the driver error. It never falls back to the
   in-memory server, so you can't accidentally write to a throwaway database
   while believing you're on Atlas.

Common connection failures: the cluster is paused or not yet provisioned, your
IP is missing from the Atlas **Network Access** allowlist, or the password in
the URI is wrong.

The in-memory database is **wiped on every restart**, which includes product,
category, staff, customer, order and branch data. It exists for offline
development only — use `USE_MEMORY_DB=true` and expect to lose your data.

## API conventions

- Every JSON resource response is wrapped: `{ products: [...] }`, `{ order: {...} }`.
- Serialised documents expose both `id` (virtual) and `_id`, and omit `__v`.
  See `src/models/plugins/applyIdVirtual.js`.
- Populated references arrive **in place of** the id field, e.g. an order's
  `staffId` is `{ _id, id, name }` when populated. Frontend code should read
  `order.staffId.name`, not `order.staff`.
- Error responses use `{ error: "..." }`. `src/utils/respondWithError.js` maps
  Mongoose `ValidationError`/`CastError` to 400, duplicate keys to 409, and
  oversized bodies to 413.
- Request bodies are limited to 6 MB.
- Only `/api/auth/login` and `/api/health` are public.

## Endpoints

### Health

| Method | Path            | Description |
| ------ | --------------- | ----------- |
| GET    | `/api/health`   | `{ status, timestamp }` |

### Auth — `/api/auth`

| Method | Path  | Auth | Description |
| ------ | ----- | ---- | ----------- |
| POST   | `/login` | public | `{ email, password }` → `{ token, user: { id, email, name, role } }` |
| GET    | `/me`    | bearer | Same `{ id, email, name, role }` shape as login |

### Store — `/api/store` (bearer)

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET    | `/`   | Single store document, auto-created if missing. |
| PUT    | `/`   | Updates `name`, `description`, `logo`, and `settings` (`primaryColor`, `accentColor`, `theme`, `paymentMethods`). Fields are merged individually. |

### Staff — `/api/staff`

| Method | Path              | Description |
| ------ | ----------------- | ----------- |
| GET    | `/`               | Filters: `role`, `status`, `search`. |
| POST   | `/`               | `name`, `role` required; `email`, `phone`, `password`, `pin`, `status` optional. Password/PIN are bcrypt-hashed. |
| POST   | `/verify-pin`     | `{ staffId, pin }` → `{ success, staff }` |
| GET    | `/:staffId`       | Single staff member (password/PIN hashes stripped). |
| PUT    | `/:staffId`       | Partial update; send `password`/`pin` to change credentials. |
| DELETE | `/:staffId`       | |

### Products & categories — `/api/products`

| Method | Path                     | Description |
| ------ | ------------------------ | ----------- |
| GET    | `/categories`            | |
| POST   | `/categories`            | `name` required. |
| PUT    | `/categories/:categoryId`| |
| DELETE | `/categories/:categoryId`| |
| GET    | `/`                      | Filters: `category` (**an id**), `search`, `isActive`. |
| POST   | `/`                      | `name`, `price` required. |
| GET    | `/:productId`            | Single product, `categoryId` populated. |
| PUT    | `/:productId`            | Partial update. |
| DELETE | `/:productId`            | |
| POST   | `/:productId/stock`      | `{ adjustment, type: 'set' \| 'adjust' }` — `set` treats `adjustment` as the absolute new count, `adjust` adds it (negative to remove). |

`/categories` is registered before `/:productId` so it is not shadowed by the
dynamic route.

### Orders — `/api/orders`

| Method | Path                | Description |
| ------ | ------------------- | ----------- |
| GET    | `/`                 | Filters: `status`, `startDate`, `endDate` (ISO dates). |
| POST   | `/`                 | See below. |
| GET    | `/:orderId`         | Single order with `customerId`, `staffId`, `branchId` populated. |
| PUT    | `/:orderId/status`  | `{ status }` — one of `pending`, `completed`, `cancelled`, `refunded`. |

`POST /api/orders`:

- `items[]` requires `productId`, `productName`, `quantity`, `unitPrice`, `totalPrice`.
- `subtotal`, `tax`, `total` are required; `tax` defaults to `0`.
- `staffId` is **required**. It falls back to the authenticated user's id when
  omitted, so the POS screen can attribute a sale to the cashier who rang it up.
- `customerId` and `branchId` are optional.
- `status` is not accepted on create; it defaults to `completed`. Use
  `PUT /:orderId/status` to change it.
- Every referenced product is loaded and its stock validated **before** anything
  is written. Stock is only decremented once all items pass.
- On success the customer's `totalSpent`, `visitCount` and `lastVisit` are updated.
- Order numbers are `ORD-YYYYMMDD-XXXXXX`; a duplicate key collision retries
  with a fresh number.

### Branches — `/api/branches`

| Method | Path          | Description |
| ------ | ------------- | ----------- |
| GET    | `/`           | |
| POST   | `/`           | `name` required; `address`, `phone`, `status` (`active`/`inactive`), `isDefault`. |
| GET    | `/:branchId`  | |
| PUT    | `/:branchId`  | Partial update. |
| DELETE | `/:branchId`  | |

`isDefault` (which branch a sale belongs to) and `status` (active/inactive) are
independent fields. The controller clears `isDefault` from other branches when
one is set as default.

### Customers — `/api/customers`

| Method | Path            | Description |
| ------ | --------------- | ----------- |
| GET    | `/`             | Filters: `tier` (`bronze`/`silver`/`gold`/`platinum`), `search`. |
| POST   | `/`             | `name` required. `tier` is server-assigned (`bronze`) — it cannot be set on create. |
| GET    | `/:customerId`  | |
| PUT    | `/:customerId`  | Partial update. |
| DELETE | `/:customerId`  | |

## Not implemented

These are referenced elsewhere in the project but have no route, controller or
model behind them. Do not expect them to work:

- Superadmin / platform-admin endpoints
- Multi-tenancy (no `storeId` scoping on any model — a single store per database)
- Per-branch inventory (products have one `stock` number, not a per-branch split)
- Product image upload (products have an `image` URL field, no storage backend)
- Email delivery (receipt "send" is frontend-only)
- Order refunds/returns beyond setting `status` to `refunded`
- Sales reports (the Reports screen is computed client-side from the orders list)
