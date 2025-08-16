import { Pool } from 'pg';
import { config } from './env';

export const pool: Pool = new Pool({
  connectionString: config.dbUrl,
});
