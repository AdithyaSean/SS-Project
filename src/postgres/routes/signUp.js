import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js';

const signupRouter = express.Router();

signupRouter.post('/signup', async (req, res) => {
    const { uid, email, username, fullName, password } = req.body;

    if (!uid || !email || !username || !fullName || !password) {
        return res.status(400).json({ error: 'Please fill all the fields' });
    }

    try {
        // Check if username already exists in PostgreSQL
        const userCheckQuery = 'SELECT * FROM users WHERE username = $1';
        const userCheckResult = await pool.query(userCheckQuery, [username]);

        if (userCheckResult.rows.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the user into PostgreSQL
        const insertUserQuery = `
            INSERT INTO users (uid, email, username, full_name, password)
            VALUES ($1, $2, $3, $4, $5) RETURNING *
        `;
        const insertValues = [uid, email, username, fullName, hashedPassword];
        const result = await pool.query(insertUserQuery, insertValues);

        // Respond with the created user (excluding the password)
        const { password: _, ...userWithoutPassword } = result.rows[0];
        return res.status(201).json({ message: 'User registered successfully', user: userWithoutPassword });
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Database error' });
    }
});

export default signupRouter;