import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js';
import signupRoute from '../routes/useSignUpWithEmailAndPassword.js';

const app = express();
app.use(express.json());
app.use('/api', signupRoute);

jest.mock('../db.js');

describe('POST /api/signup', () => {
    it('should return 201 and success message when user is registered successfully', async () => {
        const mockUser = {
            uid: '12345',
            email: 'test@example.com',
            username: 'testuser',
            fullName: 'Test User',
            bio: '',
            profilePicURL: '',
            followers: [],
            following: [],
            posts: [],
            createdAt: Date.now(),
            password: 'password123'
        };

        pool.query.mockResolvedValueOnce({ rows: [mockUser] });

        const response = await request(app)
            .post('/api/signup')
            .send(mockUser);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('User registered successfully');
    });

    it('should return 400 if password is not provided', async () => {
        const mockUser = {
            uid: '12345',
            email: 'test@example.com',
            username: 'testuser',
            fullName: 'Test User',
            bio: '',
            profilePicURL: '',
            followers: [],
            following: [],
            posts: [],
            createdAt: Date.now(),
            password: ''
        };

        const response = await request(app)
            .post('/api/signup')
            .send(mockUser);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Password is required');
    });

    it('should return 500 if there is a database error', async () => {
        const mockUser = {
            uid: '12345',
            email: 'test@example.com',
            username: 'testuser',
            fullName: 'Test User',
            bio: '',
            profilePicURL: '',
            followers: [],
            following: [],
            posts: [],
            createdAt: Date.now(),
            password: 'password123'
        };

        pool.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app)
            .post('/api/signup')
            .send(mockUser);

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Database error');
    });
});