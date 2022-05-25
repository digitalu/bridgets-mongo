import dotenv from 'dotenv';
import path from 'path';

// process.env is usually filled by docker-compose
if (!process.env.MONGODB_URL) dotenv.config({ path: path.join('.env') });

export const api = {
  env: process.env.NODE_ENV,
  projectName: process.env.PROJECT_NAME,
  port: parseInt(process.env.PORT || '') || 8080,
  mongoose: {
    url: process.env.MONGODB_URL || '',
    options: {
      minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '') || 10,
      maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '') || 50,
    },
  },
};
