import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;

export async function connectDB(): Promise<string> {
  const defaultUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/farmsetu';
  
  try {
    // First try connecting to local MongoDB daemon
    console.log(`🔌 Attempting connection to MongoDB at ${defaultUri}...`);
    await mongoose.connect(defaultUri, { serverSelectionTimeoutMS: 2000 });
    console.log('✅ Connected to MongoDB instance');
    return defaultUri;
  } catch (err) {
    console.warn('⚠️ Local MongoDB daemon not running. Spinning up embedded MongoMemoryServer...');
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'farmsetu',
        port: 27017
      }
    });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log(`✅ Connected to embedded MongoMemoryServer at ${uri}`);
    return uri;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}
