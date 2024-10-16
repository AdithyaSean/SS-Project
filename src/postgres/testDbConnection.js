import pool from './db.js';

(async () => {
  try {
    const res1 = await pool.query('SELECT NOW()');
    const res2 = await pool.query('SELECT * FROM users');

    console.log('Connection successful!');
    console.log('Server time:', res1.rows[0].now);
    console.log('Users:', res2.rows);
  } catch (err) {
    console.error('Error connecting to the database:', err);
  } finally {
    await pool.end();
  }
})();