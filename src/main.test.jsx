import request from 'supertest';
import express from 'express';
import signupRouter from './postgres/routes/signUp';

const app = express();
app.use(express.json());
app.use('/api', signupRouter);

describe('POST /api/signup', () => {
  it('should create a new user successfully', async () => {
    const response = await request(app)
      .post('/api/signup')
      .send({
        uid: 'test-uid',
        email: 'test@example.com',
        username: 'testuser',
        fullName: 'Test User',
        password: 'password123'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'User registered successfully');
    expect(response.body.user).toHaveProperty('uid', 'test-uid');
    expect(response.body.user).toHaveProperty('email', 'test@example.com');
    expect(response.body.user).toHaveProperty('username', 'testuser');
    expect(response.body.user).toHaveProperty('full_name', 'Test User');
  });

  it('should return an error if required fields are missing', async () => {
    const response = await request(app)
      .post('/api/signup')
      .send({
        uid: 'test-uid',
        email: 'test@example.com',
        username: 'testuser',
        fullName: ''
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Please fill all the fields');
  });

  it('should return an error if username already exists', async () => {
    // First, create a user
    await request(app)
      .post('/api/signup')
      .send({
        uid: 'test-uid',
        email: 'test@example.com',
        username: 'testuser',
        fullName: 'Test User',
        password: 'password123'
      });

    // Try to create another user with the same username
    const response = await request(app)
      .post('/api/signup')
      .send({
        uid: 'test-uid-2',
        email: 'test2@example.com',
        username: 'testuser',
        fullName: 'Test User 2',
        password: 'password123'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Username already exists');
  });
});