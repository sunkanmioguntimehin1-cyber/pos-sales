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

## Stock and locations

Stock is tracked **per location**. A location is a `Branch` document, and one of
them is always the **head office**.

`Stock` (`productId` + `branchId`, unique together) is the source of truth. A
product's `stock` field is a denormalised **company-wide total** kept in sync by
`src/services/stock.service.js`; every write must go through that service or the
two drift apart.

- **Exactly one head office** exists (`type: 'head_office'`), enforced by a
  partial unique index. It is always `isDefault` and is created automatically on
  boot, so there is nothing to configure.
- On upgrade from a pre-head-office database, `ensureHeadOffice()` promotes the
  existing default branch rather than creating a second one, and
  `backfillHeadOfficeStock()` gives every product a head-office stock row. Both
  are idempotent and run on every start.
- The head office **cannot be deleted, deactivated, or retyped.**
- **New product stock is always booked into the head office.** `POST /api/products`
  ignores any location and books `stock` there. Branches get their stock from
  transfers.
- `GET /api/products?branchId=X` returns that location's quantity in `stock` and
  leaves the company-wide figure in the `totalStock` virtual. Without
  `branchId`, `stock` and `totalStock` are the same number.

Because stock is per location, a sale draws from **the branch it was rung up at**
(`branchId`, defaulting to head office) and each order line records the
`locationId` it came off. Cancelling or refunding returns the goods to that same
location exactly once.

### Staff and locations

Each staff member has a `branchId` — the location they work at. It is not
optional in the UI and not nullable in practice, but is left out of the schema as
`required` so an install upgraded from before branch assignment can boot; see
below.

- **Omitting `branchId` on create files the person at the head office**, the same
  place new stock is received. A branch id that does not exist is a `400` rather
  than a silent fallback, so nobody ends up at a store they did not choose.
- **The POS lists only the selected location's staff.** `GET /api/staff?branchId=X`
  returns everyone assigned to `X` **plus all admins** — admins are not
  location-bound, so excluding them would leave a till with nobody able to ring up
  a sale whenever its cashier is away.
- `backfillStaffBranch()` runs on every boot and gives any staff record with no
  location the head office, so pre-branch records still appear on a till. It only
  touches records where `branchId` is missing, so it never moves anyone who has
  already been assigned.
- **A branch can only be deleted once it is empty.** `DELETE /api/branches/:id`
  returns `409` while the branch still holds stock or has staff assigned, naming
  both. Deleting a non-empty branch used to orphan its `Stock` rows: nothing
  could reach those units again, yet the company-wide total kept counting them.

> **No transactions.** The in-memory database is a single node with no replica
> set, so multi-document operations (transfers, order rollback) use compensating
> writes rather than `session.withTransaction()`. Transfers validate everything
> up front and unwind on failure; `scripts/smoke.js` asserts a failed transfer
> leaves stock untouched.

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
| GET    | `/`               | Filters: `role`, `status`, `search`, `branchId`. `branchId` narrows to that location plus admins; `branchId=all` returns everyone. |
| POST   | `/`               | `name`, `role` required; `email`, `phone`, `password`, `pin`, `status`, `branchId` optional. Password/PIN are bcrypt-hashed. Omitted `branchId` means the head office. |
| POST   | `/verify-pin`     | `{ staffId, pin }` → `{ success, staff }` |
| GET    | `/:staffId`       | Single staff member (password/PIN hashes stripped). |
| PUT    | `/:staffId`       | Partial update; send `password`/`pin` to change credentials. Send `branchId` to move someone; omit it to leave their location alone, or send `''` to send them back to the head office. |
| DELETE | `/:staffId`       | |

Every staff response carries `branchId`, plus `branchName`/`branchType` when the
branch is populated.

### Products & categories — `/api/products`

| Method | Path                     | Description |
| ------ | ------------------------ | ----------- |
| GET    | `/categories`            | |
| POST   | `/categories`            | `name` required. |
| PUT    | `/categories/:categoryId`| |
| DELETE | `/categories/:categoryId`| |
| GET    | `/`                      | Filters: `category` (**an id**), `search`, `isActive`, `branchId`. With `branchId`, `stock` is that location's quantity; `totalStock` is always the company-wide total. |
| POST   | `/`                      | `name`, `price` required. `stock` is **opening stock booked into the head office**. |
| GET    | `/:productId`            | Single product, `categoryId` populated. |
| PUT    | `/:productId`            | Partial update. A `stock` change is applied at the head office. |
| DELETE | `/:productId`            | Also removes the product's stock rows. |
| GET    | `/:productId/stock`      | `{ stockLevels: [{ id, branchId, branchName, branchType, quantity, updatedAt }], total }` |
| POST   | `/:productId/stock`      | `{ adjustment, type: 'set' \| 'adjust', branchId? }` — `set` treats `adjustment` as the absolute new count, `adjust` adds it (negative to remove). `branchId` defaults to the head office. A negative result is rejected. |

`/categories` is registered before `/:productId` so it is not shadowed by the
dynamic route.

### Orders — `/api/orders`

| Method | Path                | Description |
| ------ | ------------------- | ----------- |
| GET    | `/`                 | Filters: `status`, `startDate`, `endDate` (ISO dates). |
| POST   | `/`                 | See below. |
| GET    | `/:orderId`         | Single order with `customerId`, `staffId`, `branchId` populated. |
| PUT    | `/:orderId/status`  | `{ status }` — one of `pending`, `completed`, `cancelled`, `refunded`. `cancelled` and `refunded` return the items to stock. |

`POST /api/orders`:

- `items[]` requires `productId`, `productName`, `quantity`, `unitPrice`, `totalPrice`.
- `subtotal`, `tax`, `total` are required; `tax` defaults to `0`.
- `staffId` is **required**. It falls back to the authenticated user's id when
  omitted, so the POS screen can attribute a sale to the cashier who rang it up.
- `customerId` is optional. `branchId` defaults to the **head office** and is
  the location stock is drawn from; each line stores the `locationId` it came
  off, so a later return goes back to the right shelf.
- `status` is not accepted on create; it defaults to `completed`. Use
  `PUT /:orderId/status` to change it.
- Every referenced product is loaded and its stock validated **before** anything
  is written. Stock is only decremented once all items pass, and a failure part
  way through unwinds the lines already written.
- On success the customer's `totalSpent`, `visitCount` and `lastVisit` are updated.
- Moving an order to `cancelled` or `refunded` returns its items to stock and
  reverses the customer counters. This happens **once**: re-applying the same
  status is a no-op, so a double click cannot double-credit.
- Order numbers are `ORD-YYYYMMDD-XXXXXX`; a duplicate key collision retries
  with a fresh number.

### Branches — `/api/branches`

| Method | Path          | Description |
| ------ | ------------- | ----------- |
| GET    | `/`           | Head office first, then branches alphabetically. Created on demand if none exists. |
| POST   | `/`           | `name` required; `address`, `phone`, `status` (`active`/`inactive`), `manager`. Always created as `type: 'branch'` — callers cannot mint a second head office. |
| GET    | `/:branchId`  | |
| PUT    | `/:branchId`  | Partial update. `type` and `isDefault` are not editable. |
| DELETE | `/:branchId`  | Refused for the head office, and `409` while the branch still holds stock or has staff assigned. |

`isDefault` (which location new stock is booked into) and `status`
(active/inactive) are independent fields. The controller clears `isDefault` from
other branches when one is set as default, and re-asserts the head office as
default on every read.

`type` is `head_office` or `branch`. The head office is the default location,
receives all new stock, and cannot be deleted, deactivated, or retyped. `manager`
is a free-text name and is not linked to a staff account.

### Stock transfers — `/api/transfers`

Moves stock from one location to another. Records are immutable; there is no
update or delete.

| Method | Path            | Description |
| ------ | --------------- | ----------- |
| GET    | `/`             | Filters: `branchId` (matches transfers in either direction), `startDate`, `endDate`, `limit`. `fromBranchId`, `toBranchId` and `staffId` are populated. |
| POST   | `/`             | `{ fromBranchId, toBranchId, items: [{ productId, productName?, quantity }], staffId?, notes? }` |
| GET    | `/:transferId`  | Single transfer. |

`POST /api/transfers`:

- The two locations must differ, and the source must hold enough of every line.
- Duplicate products in `items` are merged before the source is checked.
- Stock is deducted from the source and added to the destination, then the
  product totals are resynced. Any failure unwinds the writes that landed, so a
  rejected transfer leaves stock exactly as it was.
- A transfer never changes the company-wide total — only where it sits.

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
- Product image upload (products have an `image` URL field, no storage backend)
- Email delivery (receipt "send" is frontend-only)
- Partial refunds or returns — a refund is all-or-nothing for the order
- Sales reports (the Reports screen is computed client-side from the orders list)
- Stock movement history: `GET /api/products/:id/stock` returns current
  quantities per location, not a ledger of past movements. `StockLog` rows from
  the Inventory screen's "Movement Log" tab are not persisted by the API.

## Tests

```bash
npm test                        # node:test — 45 tests
node scripts/smoke.js <url>     # end-to-end HTTP against a running server
```

`test/` covers the stock service, location-aware orders, and transfers against
an in-memory MongoDB. `scripts/smoke.js` exercises the same paths over real HTTP
and asserts, among other things, that a failed transfer changes nothing and that
re-cancelling an order does not double-credit stock.
