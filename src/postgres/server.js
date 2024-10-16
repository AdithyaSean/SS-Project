import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import signupRoute from './routes/useSignUpWithEmailAndPassword.js';
import loginRoute from './routes/useLogin.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5033;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

// routes
app.use('/api/signup', signupRoute);
app.use('/api/login', loginRoute);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});