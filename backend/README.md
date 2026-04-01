# POS SaaS Backend

Express.js + MongoDB API for the POS SaaS application.

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A strong secret key for JWT tokens

### 3. Get MongoDB Atlas Connection String

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a cluster (free tier available)
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password

### 4. Run the Server

```bash
npm run dev
```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (email + password) |
| POST | `/api/auth/register` | Register superadmin (first time) |
| GET | `/api/auth/me` | Get current user |

### Superadmin (requires superadmin token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/superadmin/stores` | Create new store |
| GET | `/api/superadmin/stores` | List all stores |
| GET | `/api/superadmin/stores/:id` | Get store details |
| PUT | `/api/superadmin/stores/:id` | Update store |
| DELETE | `/api/superadmin/stores/:id` | Delete store |

### Store Operations (requires auth + X-Tenant-Id header)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stores/me` | Get current store |
| PUT | `/api/stores/me` | Update current store |

### Staff

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/staff` | List staff (requires X-Tenant-Id) |
| POST | `/api/staff` | Create staff member |
| PUT | `/api/staff/:id` | Update staff member |
| DELETE | `/api/staff/:id` | Delete staff member |
| POST | `/api/staff/verify-pin` | Verify staff PIN |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| POST | `/api/products/:id/stock` | Adjust stock |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/categories` | List categories |
| POST | `/api/products/categories` | Create category |
| PUT | `/api/products/categories/:id` | Update category |
| DELETE | `/api/products/categories/:id` | Delete category |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List orders |
| POST | `/api/orders` | Create order |
| GET | `/api/orders/:id` | Get order details |
| PUT | `/api/orders/:id/status` | Update order status |

### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List customers |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |

### Branches

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/branches` | List branches |
| POST | `/api/branches` | Create branch |
| PUT | `/api/branches/:id` | Update branch |
| DELETE | `/api/branches/:id` | Delete branch |

## Authentication Flow

1. **Superadmin Registration**: `POST /api/auth/register` with email, password, name
2. **Login**: `POST /api/auth/login` returns JWT token
3. **Use Token**: Include `Authorization: Bearer <token>` header in requests
4. **Store Access**: Include `X-Tenant-Id: <tenant_id>` header for store-specific routes

## Example: Create a Store (Superadmin)

```bash
curl -X POST http://localhost:5000/api/superadmin/stores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <superadmin_token>" \
  -d '{
    "name": "My Store",
    "subdomain": "mystore",
    "adminName": "John Doe",
    "adminEmail": "john@mystore.com",
    "adminPassword": "securepassword123"
  }'
```

## Example: Login as Store Admin

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@mystore.com",
    "password": "securepassword123"
  }'
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB Atlas connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `PORT` | Server port (default: 5000) | No |
| `FRONTEND_URL` | Frontend URL for CORS (default: http://localhost:3000) | No |
| `NODE_ENV` | Environment (development/production) | No |

## Development

```bash
npm run dev    # Run with hot reload
npm run build  # Build for production
npm start      # Run production build
```
