import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import signupRouter from './routes/signUp.js';

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

// routes
app.use('/api', signupRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});