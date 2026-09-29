import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import { seedAdmin } from './seed.js';
import { ensureHeadOffice, backfillHeadOfficeStock, backfillStaffBranch } from './services/stock.service.js';
import storeRoutes from './routes/store.routes.js';
import staffRoutes from './routes/staff.routes.js';
import productsRoutes from './routes/products.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import branchesRoutes from './routes/branches.routes.js';
import customersRoutes from './routes/customers.routes.js';
import transfersRoutes from './routes/transfers.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// FRONTEND_URL is a comma-separated list of allowed origins. The cors package
// accepts an array and reflects whichever entry matches the request's Origin
// header, which is what lets credentials: true stay safe (never '*').
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
// Product images are uploaded inline as base64 data URLs, so the default 100kb
// limit rejects them. Keep headroom above the 5MB the UI advertises.
app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ extended: true, limit: '6mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/branches', branchesRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/transfers', transfersRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, _req, res, _next) => {
  if (err?.type === 'entity.too.large') {
    res.status(413).json({ error: 'Payload too large' });
    return;
  }

  if (err?.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err?.name === 'CastError') {
    res.status(400).json({ error: `Invalid ${err.path}: ${err.value}` });
    return;
  }

  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

async function startServer() {
  await connectDB();
  await seedAdmin();

  // Before serving any request: the head office is the location new stock is
  // booked into, so nothing that writes a product can run without it. The
  // backfill is idempotent and only seeds rows that are genuinely missing.
  const headOffice = await ensureHeadOffice();
  const seeded = await backfillHeadOfficeStock();
  console.log(`Head office: ${headOffice.name} (${headOffice._id})`);
  if (seeded > 0) {
    console.log(`Seeded head office stock for ${seeded} product(s)`);
  }

  // Staff predating branch assignment have no location, and the POS only lists
  // staff who work at the selected location — so they must be filed at the
  // head office or they would never appear on any till.
  const staffFiled = await backfillStaffBranch();
  if (staffFiled > 0) {
    console.log(`Assigned ${staffFiled} staff member(s) to the head office`);
  }

  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use.`);
      console.error(`   Something else is listening there — check with: lsof -nP -iTCP:${PORT} -sTCP:LISTEN`);
      if (PORT === 5000) {
        console.error(`   On macOS, port 5000 is usually AirPlay Receiver (System Settings > General > AirDrop & Handoff).`);
      }
      console.error(`   Set a different PORT in backend/.env (and match NEXT_PUBLIC_API_URL in frontend/.env.local).`);
    } else {
      console.error('❌ Server error:', err.message);
    }
    process.exit(1);
  });
}

startServer();

async function shutdown(signal) {
  console.log(`\n${signal} received — shutting down`);
  await disconnectDB();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

export default app;
