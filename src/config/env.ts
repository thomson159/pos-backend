import dotenv from 'dotenv';
import { ConfigType } from 'src/consts/types';
dotenv.config();

export const config: ConfigType = {
  port: process.env.PORT || 5000,
  dbUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'supersecret',
};
