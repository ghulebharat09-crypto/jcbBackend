import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const envConfig = {
  PORT: parseInt(process.env.PORT || '8200', 10),
  HOST: process.env.HOST || '0.0.0.0',
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',
  DB_HOST: process.env.DATABASE_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DATABASE_PORT || '5432', 10),
  DB_USER: process.env.DATABASE_USERNAME || 'postgres',
  DB_PASSWORD: process.env.DATABASE_PASSWORD || '',
  DB_NAME: process.env.DATABASE_NAME || 'jcb_fleet_management',
  DB_SSL: process.env.DATABASE_SSL === 'true',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'jcb_fleet_management_secure_jwt_token_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Admin Key
  ADMIN_REGISTRATION_KEY: process.env.ADMIN_REGISTRATION_KEY || 'jcb_admin_secret_2026'
};

export default envConfig;
