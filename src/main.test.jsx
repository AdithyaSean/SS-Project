import request from 'supertest';
import express from 'express';
import signupRouter from './postgres/routes/signUp';
import MockFirebase from 'mock-cloud-firestore';
import firebase from 'firebase/compat/app';

const app = express();
app.use(express.json());
app.use('/api', signupRouter);

// Mock Firebase
const fixtureData = {
  __collection__: {
    users: {
      __doc__: {
        'test-uid': {
          uid: 'test-uid',
          email: 'test@example.com',
          username: 'testuser',
          fullName: 'Test User',
          password: 'password123'
        }
      }
    }
  }
};

const mockFirestore = new MockFirebase(fixtureData);
firebase.firestore = mockFirestore.firestore;

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

    console.log('Response status:', response.status);
    console.log('Response body:', response.body);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'User registered successfully');
    expect(response.body.user).toHaveProperty('uid', 'test-uid');
    expect(response.body.user).toHaveProperty('email', 'test@example.com');
    expect(response.body.user).toHaveProperty('username', 'testuser');
    expect(response.body.user).toHaveProperty('full_name', 'Test User');

    // Check Firebase
    const userDoc = await firebase.firestore().collection('users').doc('test-uid').get();
    expect(userDoc.exists).toBe(true);
    const userData = userDoc.data();
    expect(userData).toHaveProperty('uid', 'test-uid');
    expect(userData).toHaveProperty('email', 'test@example.com');
    expect(userData).toHaveProperty('username', 'testuser');
    expect(userData).toHaveProperty('full_name', 'Test User');
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