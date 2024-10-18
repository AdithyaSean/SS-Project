import pkg from 'pg'; // Import the default export
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg; // Destructure the Pool object from the default export

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT, // Default PostgreSQL port
});

export default pool;