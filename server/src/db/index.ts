import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { env } from '../env.js';
import * as schema from './schema.js';

const pool = mysql.createPool({
  uri: env.databaseUrl,
  connectionLimit: 10,
  // DATE columns come back as 'YYYY-MM-DD' strings rather than JS Dates in the server's
  // timezone — a birthday must not shift because the process runs in UTC.
  dateStrings: ['DATE'],
});

export const db = drizzle(pool, { schema, mode: 'default' });
export { schema };

export const pingDatabase = async (): Promise<void> => {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
  } finally {
    conn.release();
  }
};
