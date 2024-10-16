import express from 'express';
import pool from './db.js'; // Adjust the path to your db.js file
import bodyParser from 'body-parser';
import cors from 'cors'; // Import the cors package
import bcrypt from 'bcryptjs';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

// Endpoint to register a user
app.post('/api/signup', async (req, res) => {
    const { uid, email, username, fullName, bio, profilePicURL, followers, following, posts, createdAt, password } = req.body;

    try {
        // Check if password is provided
        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }
        // Hash the password before saving it to PostgreSQL
        const hashedPassword = await bcrypt.hash(password, 10);
        // Convert createdAt from Unix timestamp (milliseconds) to a PostgreSQL-compatible date
        const createdAtDate = new Date(createdAt).toISOString();

        const result = await pool.query(
            'INSERT INTO users (uid, email, username, password, full_name, bio, profile_pic_url, followers, following, posts, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
            [uid, email, username, hashedPassword, fullName, bio, profilePicURL, followers, following, posts, createdAtDate]
        );
        res.status(201).json({ message: 'User registered successfully', result });
    } catch (error) {
        console.error('Error saving user to PostgreSQL:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
