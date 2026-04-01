# Frontend (Next.js)

The Next.js frontend for the POS SaaS application.

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
- `NEXT_PUBLIC_API_URL`: Your backend API URL (default: http://localhost:5000)

### 3. Run the Development Server

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

## Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth routes (login, etc.)
│   ├── (auth)/login/      # Login page
│   ├── dashboard/         # Store dashboard
│   └── superadmin/        # Superadmin dashboard
├── components/            # React components
├── lib/
│   └── api/              # API client & endpoints
└── store/                # Zustand stores (auth, tenant, theme)
```

## Authentication Flow

1. User visits `/login`
2. Enters email + password
3. Token stored in localStorage
4. Redirects based on role:
   - `superadmin` → `/superadmin`
   - `tenant_admin` / `staff` → `/dashboard`

## API Integration

All API calls go to the Express.js backend. The frontend includes:
- `src/lib/api/client.ts` - Base API client with auth headers
- `src/lib/api/*.ts` - Typed API endpoints
- `src/store/authStore.ts` - Authentication state

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | http://localhost:5000 |
