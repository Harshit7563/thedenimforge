import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://harshit@localhost:5432/thedenimforge',
});

export default pool;
