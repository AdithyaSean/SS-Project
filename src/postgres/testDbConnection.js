import pool from './db.js'; // Import the pool from db.js

(async () => {
  try {
    // Perform a simple query to check the connection
    const res = await pool.query('SELECT NOW()');
    console.log('Connection successful! Server time:', res.rows[0].now);
  } catch (err) {
    console.error('Error connecting to the database:', err);
  } finally {
    // Close the pool to avoid hanging connections
    await pool.end();
  }
})();
