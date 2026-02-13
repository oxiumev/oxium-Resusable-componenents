import mongoose from 'mongoose';
import { ENV } from '../../config/env';
import logger from '../logger';

let isConnected = false;

export async function connectToDatabase(retries = 5): Promise<void> {
  if (isConnected) return;

  while (retries) {
    try {
      await mongoose.connect(ENV.MONGO_URI, {
        autoIndex: ENV.NODE_ENV !== 'production',
      });

      isConnected = true;
      logger.info("MongoDB connected ✅");
      return;
    } catch (error) {
      retries -= 1;
      logger.error(`❌ MongoDB connection failed. Retries left: ${retries}`);

      if (!retries) {
        logger.error('❌ Exiting process.');
        process.exit(1);
      }

      await new Promise((res) => setTimeout(res, 3000));
    }
  }
}
