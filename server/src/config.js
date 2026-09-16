import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

dotenv.config();

export const config = {
    port: Number(process.env.PORT) || 5000,
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/innovprocure?schema=public',
    aiApiKey: process.env.AI_API_KEY || '',
    aiModel: process.env.AI_MODEL || 'gemini-2.0-flash',
    aiProvider: process.env.AI_PROVIDER || 'gemini',
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    nodeEnv: process.env.NODE_ENV || 'development'
};
