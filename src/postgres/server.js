import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

// Route to handle user signup
app.post('/api/signup', async (req, res) => {
    const { uid, email, username, fullName, bio, profilePicURL, followers, following, posts, createdAt } = req.body;

    try {
        const queryText = `
            INSERT INTO users (uid, email, username, full_name, bio, profile_pic_url, followers, following, posts, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `;
        const queryValues = [uid, email, username, fullName, bio, profilePicURL, followers, following, posts, createdAt];

        await pool.query(queryText, queryValues);

        res.status(201).send({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error inserting user into database:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// Route to handle user login
app.post('/api/login', async (req, res) => {
    const { uid } = req.body;

    try {
        const queryText = 'SELECT * FROM users WHERE uid = $1';
        const queryValues = [uid];

        const result = await pool.query(queryText, queryValues);

        if (result.rows.length > 0) {
            res.status(200).send(result.rows[0]);
        } else {
            res.status(404).send({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user from database:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});