import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Please fill all the fields" });
    }

    try {
        // Fetch user data from PostgreSQL
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        // Check if user exists
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Compare the provided password with the hashed password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // If password is correct, return success response
        return res.status(200).json({ message: "Login successful", user });
    } catch (error) {
        console.error('Error fetching user from PostgreSQL:', error);
        return res.status(500).json({ error: 'Database error', details: error.message });
    }
});

export default router;