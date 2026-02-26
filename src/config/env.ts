import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    MONGO_URI: z.string().min(1).default('mongodb://localhost:27017/oxium'),
    JWT_SECRET: z.string().min(1).default('supersecretkey'),
    GITHUB_CLIENT_ID: z.string().default(''),
    GITHUB_CLIENT_SECRET: z.string().default(''),
    GOOGLE_CLIENT_ID: z.string().default(''),
    GOOGLE_CLIENT_SECRET: z.string().default(''),
    ACCESS_TOKEN_SECRET: z.string().min(1).default('access_secret'),
    REFRESH_TOKEN_SECRET: z.string().min(1).default('refresh_secret'),
    GOOGLE_CALLBACK_URL: z.string().url().default('http://127.0.0.1:4000/auth/google/callback'),
    GITHUB_CALLBACK_URL: z.string().url().default('http://127.0.0.1:4000/auth/github/callback'),
    DOMAIN: z.string().default('127.0.0.1'),
    FRONTEND_URL: z.string().default(''),
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().int().positive().default(6379),
    FIREBASE_API_KEY: z.string().default(''),
    RECAPTCHA_SECRET_KEY: z.string().default(''),
    AWS_S3_BUCKET_NAME:z.string().default(''),
    AWS_S3_REGION:z.string().default('ap-south-1'),
    AWS_ACCESS_KEY_ID:z.string().default(''),
    AWS_SECRET_ACCESS_KEY:z.string().default(''),
    // Nodemailer / SMTP
    SMTP_HOST: z.string().default('smtp.gmail.com'),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_USER: z.string().default(''),
    SMTP_PASS: z.string().default(''),
    SMTP_FROM: z.string().default(''), // If set, used as full "From". If empty, built from SMTP_USER as no_reply.{user}@domain.
    SMTP_FROM_NAME: z.string().default('Oxium No-Reply'), // Display name only when SMTP_FROM is empty (auto-built address).
});

const parseEnv = () => {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('❌ Invalid environment variables:');
            error.issues.forEach((issue) => {
                const path = issue.path.join('.');
                console.error(`  - ${path}: ${issue.message}`);
            });
            process.exit(1);
        }
        throw error;
    }
};

export const ENV = parseEnv();