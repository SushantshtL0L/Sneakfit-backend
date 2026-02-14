import request from 'supertest';
import app from '../../app';
import { User } from '../../models/user.model';
import mongoose from 'mongoose';

describe('Auth Integration Tests', () => {
    
    const testUser = {
        name: 'Test User',
        username: 'testuser123',
        email: 'testauth@example.com',
        password: 'Password123!',
        role: 'user'
    };

    // Clean up database 
    beforeAll(async () => {
        
    });

    
    beforeEach(async () => {
        await User.deleteMany({ email: testUser.email });
    });

    // Clean up after all tests
    afterAll(async () => {
        await User.deleteMany({ email: testUser.email });
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser);
            
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message', 'User registered successfully');
            expect(response.body.user).toHaveProperty('email', testUser.email);
        });

        it('should return 400 for invalid email', async () => {
            const invalidUser = { ...testUser, email: 'not-an-email' };
            const response = await request(app)
                .post('/api/auth/register')
                .send(invalidUser);
            
            expect(response.status).toBe(400);
        });
        
        it('should fail if email already exists', async () => {
            // First register
            await request(app).post('/api/auth/register').send(testUser);
            
            // Try again
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser);
            
            expect(response.status).toBe(409); // Conflict
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            //  user for login test
            await request(app).post('/api/auth/register').send(testUser);
        });

        it('should login successfully with correct credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
        });

        it('should fail login with incorrect password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'WrongPassword'
                });
            
            expect(response.status).toBe(401); 
        });

        it('should fail login with non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'ghost@example.com',
                    password: 'Password123'
                });
            
            expect(response.status).toBe(404); // Not Found
        });
    });
});
