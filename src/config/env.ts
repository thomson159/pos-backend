import dotenv from 'dotenv';

export type ConfigType = {
  port: number | string;
  dbUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string | number;
};

dotenv.config();

export const config: ConfigType = {
  port: process.env.PORT || 5000,
  dbUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'supersecret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
};
