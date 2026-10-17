import { MongoClient } from 'mongodb';

let clientPromise: Promise<MongoClient> | null = null;

/**
 * Shared MongoClient promise for the NextAuth adapter.
 * Returns null when MONGODB_URI is not set (e.g. during `next build`), instead of throwing at import time.
 */
export function getMongoClientPromise(): Promise<MongoClient> | null {
  if (clientPromise) return clientPromise;

  const uri = process.env.MONGODB_URI;
  if (!uri) return null;

  // In development, keep the client on `global` so it survives HMR module reloads.
  const g = global as any;
  if (process.env.NODE_ENV === 'development') {
    if (!g._mongoClientPromise) {
      g._mongoClientPromise = new MongoClient(uri).connect();
    }
    clientPromise = g._mongoClientPromise as Promise<MongoClient>;
  } else {
    clientPromise = new MongoClient(uri).connect();
  }
  return clientPromise;
}
