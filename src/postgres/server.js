import express from 'express';
import pool from './db.js'; // Adjust the path to your db.js file
import bodyParser from 'body-parser';
import cors from 'cors'; // Import the cors package
import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 5033;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

// Endpoint to register a user
app.post('/api/signup', async (req, res) => {
    const { uid, email, username, fullName, bio, profilePicURL, followers, following, posts, createdAt, password } = req.body;

    try {
        // The password is already hashed by the frontend, so no need to hash it again
        // Convert createdAt from Unix timestamp (milliseconds) to a PostgreSQL-compatible date
        const createdAtDate = new Date(createdAt).toISOString();

        const result = await pool.query(
            'INSERT INTO users (uid, email, username, password, full_name, bio, profile_pic_url, followers, following, posts, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
            [uid, email, username, password, fullName, bio, profilePicURL, followers, following, posts, createdAtDate]
        );
        res.status(201).json({ message: 'User registered successfully', result });
    } catch (error) {
        console.error('Error saving user to PostgreSQL:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// New endpoint to handle user login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Retrieve user from database
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // Compare provided password with stored hash
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        //  // If password is valid, generate a JWT token
        //  const token = jwt.sign(
        //     { uid: user.uid, email: user.email, username: user.username }, 
        //     process.env.JWT_SECRET, // Ensure you have a secret key set in your environment variables
        //     { expiresIn: '1h' }
        // );


        // If password is valid, send back user data (excluding password)
        const { password: _, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword, token });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
