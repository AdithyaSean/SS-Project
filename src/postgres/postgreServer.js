// Import necessary modules
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

// Create an Express app
const app = express();
const port = 5033;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// PostgreSQL connection pool
const pool = new Pool({
  user: 'admin',
  host: '217.142.190.95',
  database: 'instaclone',
  password: 'admin',
  port: 5432,
});

// Test route to check database connection
app.get('/test-connection', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection successful:', result.rows[0].now);
    res.status(200).json({ success: true, time: result.rows[0].now });
  } catch (err) {
    console.error('Database connection failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});