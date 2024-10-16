import pkg from 'pg'; // Import the default export
const { Pool } = pkg; // Destructure the Pool object from the default export

const pool = new Pool({
  user: 'postgres',
  host: '217.142.190.32', // Your VPS IP
  database: 'test1',
  password: '12345',
  port: 5432, // Default PostgreSQL port
});

export default pool;
