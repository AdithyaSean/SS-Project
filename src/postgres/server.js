import express from 'express';
import pool from './db.js';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 5033;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Use an environment variable in production


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });


// Custom logging middleware
const logUserBehavior = (req, res, next) => {
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const logEntry = `${timestamp} - ${req.method} ${req.url} - ${req.ip}\n`;
    accessLogStream.write(logEntry);
    next();
};

// Middleware
app.use(cors());
app.use(logUserBehavior);
app.use(bodyParser.json());

// Endpoint to register a user
app.post('/api/signup', async (req, res) => {
    const { uid, email, username, fullName, bio, profilePicURL, followers, following, posts, createdAt, password } = req.body;

    try {
        // Validate inputs here (e.g., check if email/username already exists)
        
        const hashedPassword = await bcrypt.hash(password, 10); // Hashing password
        const createdAtDate = new Date(createdAt).toISOString();

        const result = await pool.query(
            'INSERT INTO users (uid, email, username, password, full_name, bio, profile_pic_url, followers, following, posts, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
            [uid, email, username, hashedPassword, fullName, bio, profilePicURL, followers, following, posts, createdAtDate]
        );

        // Log successful signup
        const signupTimestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
        const signupLogEntry = `${signupTimestamp} - New user signed up: ${email} (${username})\n`;
        accessLogStream.write(signupLogEntry);

        res.status(201).json({ message: 'User registered successfully', result });
    } catch (error) {
        // Log failed signup attempt
        const failedSignupTimestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
        const failedSignupLogEntry = `${failedSignupTimestamp} - Failed signup attempt: ${email} (${username}) - Error: ${error.message}\n`;
        accessLogStream.write(failedSignupLogEntry);

        console.error('Error saving user to PostgreSQL:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// Endpoint to handle user login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Create a JWT token
        const token = jwt.sign(
            { userId: user.uid, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Log successful login
        const loginTimestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
        const loginLogEntry = `${loginTimestamp} - User logged in: ${email}\n`;
        accessLogStream.write(loginLogEntry);

        const { password: _, ...userWithoutPassword } = user;
        res.json({
            message: 'Login successful',
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
