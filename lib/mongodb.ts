import mongoose from 'mongoose';

function getMongoUri(): string {
  const uri = process.env.MONGO_URI ?? process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Missing required environment variable: MONGO_URI');
  }
  return uri;
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const globalCache = global.mongooseCache ?? { conn: null, promise: null };

global.mongooseCache = globalCache;

export async function connectToMongo(): Promise<typeof mongoose> {
  const MONGO_URI = getMongoUri();

  if (globalCache.conn) return globalCache.conn;

  if (!globalCache.promise) {
    globalCache.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
    });
  }

  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
}
