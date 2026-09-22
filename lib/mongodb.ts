import { MongoClient, Db } from 'mongodb';

const dbName = process.env.MONGODB_DB || 'albam_db';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export async function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable in your project settings.');
  }

  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    global._mongoClientPromise = client.connect();
  }
  return global._mongoClientPromise;
}

export async function getDatabase(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}

export default getMongoClient;
