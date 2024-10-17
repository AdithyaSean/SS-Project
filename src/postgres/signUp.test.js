import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import signupRouter from './routes/signUp.js';
import pool from './db.js';

// Create an instance of the Express app
const app = express();
app.use(express.json());
app.use('/api', signupRouter);

jest.mock('./db.js');

describe('POST /api/signup', () => {
    it('should return 201 and success message when user is registered successfully', async () => {
        const mockUser = {
            email: 'test@example.com',
            username: 'testuser',
            fullName: 'Test User',
            password: 'password123',
        };

        // Mock the database response for user creation
        pool.query.mockImplementationOnce((query) => {
            // Mock behavior for checking existing username
            if (query.includes('SELECT * FROM users WHERE username')) {
                return Promise.resolve({ rows: [] }); // No existing user found
            }

            // Mock behavior for inserting the new user
            if (query.includes('INSERT INTO users')) {
                return Promise.resolve({
                    rows: [{
                        uid: '12345',
                        email: mockUser.email,
                        username: mockUser.username,
                        full_name: mockUser.fullName,
                    }],
                });
            }

            // Default to returning an empty object if not matched
            return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
            .post('/api/signup')
            .send(mockUser);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('User registered successfully');
        expect(response.body.user).toMatchObject({
            email: 'test@example.com',
            username: 'testuser',
            full_name: 'Test User',
        });
    });

    it('should return 400 if username already exists', async () => {
        const mockUser = {
            email: 'test@example.com',
            username: 'testuser',
            fullName: 'Test User',
            password: 'password123',
        };

        // Mock the database response for username check
        pool.query.mockImplementationOnce((query) => {
            if (query.includes('SELECT * FROM users WHERE username')) {
                return Promise.resolve({ rows: [{ username: 'testuser' }] }); // Existing user found
            }
        });

        const response = await request(app)
            .post('/api/signup')
            .send(mockUser);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Username already exists');
    });

    it('should return 500 if there is a database error', async () => {
        const mockUser = {
            email: 'test@example.com',
            username: 'testuser',
            fullName: 'Test User',
            password: 'password123',
        };

        // Mock the database response to simulate an error
        pool.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app)
            .post('/api/signup')
            .send(mockUser);

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Database error');
    });
});