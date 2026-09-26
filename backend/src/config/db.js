import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';
const USE_MEMORY_DB = process.env.USE_MEMORY_DB === 'true';

let memoryServer = null;

async function startMemoryServer() {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create({ instance: { dbName: 'pos-saas' } });
  return memoryServer.getUri('pos-saas');
}

async function isReachable(uri) {
  try {
    const probe = mongoose.createConnection();
    await probe.openUri(uri, { serverSelectionTimeoutMS: 5000 });
    await probe.close();
    return true;
  } catch {
    return false;
  }
}

export async function connectDB() {
  let uri = MONGODB_URI;

  if (USE_MEMORY_DB || !uri) {
    if (MONGODB_URI) {
      console.warn('⚠️  USE_MEMORY_DB=true — ignoring MONGODB_URI');
    }
    console.log('🗄️  Starting in-memory MongoDB…');
    uri = await startMemoryServer();
  } else if (!(await isReachable(uri))) {
    console.warn('⚠️  Could not reach MONGODB_URI — falling back to in-memory MongoDB.');
    console.warn('   Set a working connection string in backend/.env to use a real database.');
    uri = await startMemoryServer();
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
    if (memoryServer) {
      console.log('   (ephemeral in-memory instance — data resets when the process exits)');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }

  return mongoose.connection;
}

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message);
});

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

export default mongoose;
