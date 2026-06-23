import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function setup() {
  const schemaPath = path.join(__dirname, '../../../database/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(schema);
  console.log('Database schema created successfully.');
  await pool.end();
}

setup().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
