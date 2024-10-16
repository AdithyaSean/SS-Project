import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import signupRoute from './routes/useSignUpWithEmailAndPassword';
import loginRoute from './routes/useLogin';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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