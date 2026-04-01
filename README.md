# POS SaaS

A multi-tenant Point of Sale (POS) SaaS application.

## Structure

```
├── frontend/           # Next.js frontend (React)
│   └── src/
│       ├── app/       # Pages (login, dashboard, superadmin)
│       ├── components/ # React components
│       ├── lib/api/   # API client
│       └── store/     # Zustand stores
│
└── backend/           # Express.js backend (API)
    └── src/
        ├── models/    # MongoDB schemas
        ├── routes/    # API endpoints
        ├── controllers/ # Business logic
        └── middleware/  # Auth & tenant isolation
```

## Quick Start

### 1. Set up MongoDB Atlas

1. Create account at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a cluster (free tier available)
3. Get connection string

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI
```

### 3. Start Backend

```bash
cd backend
npm install
npm run dev
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

## Frontend

- **Port**: `http://localhost:3000`
- **Stack**: Next.js 16, React 19, Zustand, Tailwind

## Backend

- **Port**: `http://localhost:5000`
- **Stack**: Express.js, MongoDB/Mongoose, JWT

## API Docs

See `backend/README.md` for full API documentation.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, React, Zustand |
| Backend | Express.js, TypeScript |
| Database | MongoDB Atlas |
| Auth | JWT |
