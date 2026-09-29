import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * Each test file gets its own in-memory server.
 *
 * This is the same single-node topology the app's USE_MEMORY_DB fallback uses
 * (backend/src/config/db.js:11-15) precisely because the production code is
 * written without multi-document transactions — there is no replica set here,
 * so the tests exercise the same constraints as the real dev boot.
 */
let server;

export async function connectTestDB() {
  server = await MongoMemoryServer.create({ instance: { dbName: 'pos-test' } });
  await mongoose.connect(server.getUri('pos-test'), { serverSelectionTimeoutMS: 10000 });

  // autoIndex builds indexes on model init, but doing it explicitly makes the
  // unique constraints the tests depend on deterministic.
  const models = Object.values(mongoose.models);
  await Promise.all(models.map((model) => model.syncIndexes()));
}

export async function disconnectTestDB() {
  await mongoose.disconnect();
  if (server) {
    await server.stop();
    server = undefined;
  }
}

export async function clearAll() {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
}

/** Minimal express request/response doubles for exercising a controller directly. */
export function mockRes() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}
