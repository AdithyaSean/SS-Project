import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  user: import.meta.env.DB_USER,
  host: import.meta.env.DB_HOST,
  database: import.meta.env.DB_DATABASE,
  password: import.meta.env.DB_PASSWORD,
  port: import.meta.env.DB_PORT,
});

export default pool;