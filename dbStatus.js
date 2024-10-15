import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  host: '217.142.190.95',
  port: 5432,
  user: 'admin',
  password: 'admin',
  database: 'instaclone'
});

async function checkDbStatus() {
  try {
    await client.connect();
    console.log('Connected to the database successfully.');
    const res = await client.query('SELECT NOW()');
    console.log('Database time:', res.rows[0].now);
  } catch (err) {
    console.error('Error connecting to the database:', err.stack);
  } finally {
    await client.end();
  }
}

checkDbStatus();