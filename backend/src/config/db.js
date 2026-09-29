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

export async function connectDB() {
  let uri = MONGODB_URI;

  if (USE_MEMORY_DB || !uri) {
    if (MONGODB_URI) {
      console.warn('⚠️  USE_MEMORY_DB=true — ignoring MONGODB_URI');
    }
    console.log('🗄️  Starting in-memory MongoDB…');
    uri = await startMemoryServer();
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  } catch (error) {
    console.error('❌ Could not connect to MongoDB at MONGODB_URI.');
    console.error(`   ${error.message}`);
    console.error('   Check that the cluster is running, your IP is in the Atlas');
    console.error('   Network Access allowlist, and the credentials in the URI are correct.');
    process.exit(1);
  }

  if (memoryServer) {
    console.log('✅ Connected to MongoDB (ephemeral in-memory instance — data resets when the process exits)');
  } else {
    console.log(`✅ Connected to MongoDB "${mongoose.connection.name}"`);
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
