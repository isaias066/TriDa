import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
    PORT: process.env.PORT || 5000,
    DB: {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'TriDa',
        password: process.env.DB_PASSWORD || '1234',
        port: Number(process.env.DB_PORT) || 5432,
    },
    JWT_SECRET: process.env.JWT_SECRET || 'trida_super_secret_key_change_me_2025_x9k7m2p4q8w1',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};

