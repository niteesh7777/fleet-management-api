import mongoose from 'mongoose';
import { config } from './env.js';
import { dbName } from '../constants.js';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

let connected = false;

async function connectDB() {
  let attempt = 0;
  while (!connected && attempt <= MAX_RETRIES) {
    try {
      await mongoose.connect(config.mongoURI, {
        dbName: dbName,
        autoIndex: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      });
      connected = true;
      console.log('✅ MongoDB connected');
      return mongoose.connection;
    } catch (err) {
      attempt++;
      console.error(`MongoDB connect attempt ${attempt} failed:`, err.message);
      if (attempt > MAX_RETRIES) {
        console.error('Exceeded max connection attempts. Exiting.');
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }
}

function getConnection() {
  if (!connected) throw new Error('Mongo not connected - call connectDB first');
  return mongoose.connection;
}

function closeConnection() {
  return mongoose.disconnect();
}

export default connectDB;
export { getConnection, closeConnection };
