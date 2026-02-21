import dotenv from 'dotenv';
dotenv.config();
export const ENV = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 4000,
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/oxium',
    JWT_SECRET: process.env.JWT_SECRET || 'supersecretkey',
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || 'access_secret',    
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'refresh_secret',
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://127.0.0.1:4000/auth/google/callback',
    GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL || 'http://127.0.0.1:4000/auth/github/callback',
    DOMAIN: process.env.DOMAIN || '127.0.0.1',
    FRONTEND_URL: process.env.FRONTEND_URL || "",
    REDIS_HOST:process.env.REDIS_HOST || 'localhost',
    REDIS_PORT:Number(process.env.REDIS_PORT) || 6379,
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || '',
};