import request from 'supertest';
import app from '../../app';
import { User } from '../../models/user.model';
import mongoose from 'mongoose';
import path from 'path';

describe('User Integration Tests', () => {
    let userToken: string;

    const testUser = {
        name: 'Profile User',
        username: 'profileuser',
        email: 'profile@test.com',
        password: 'Password123!'
    };

    beforeAll(async () => {
        await User.deleteMany({ email: testUser.email });
        await request(app).post('/api/auth/register').send(testUser);
        const loginRes = await request(app).post('/api/auth/login').send({
            email: testUser.email,
            password: testUser.password
        });
        userToken = loginRes.body.token;
    });

    afterAll(async () => {
        await User.deleteMany({ email: testUser.email });
    });

    describe('GET /api/users/me', () => {
        it('should fetch own profile details and contain role', async () => {
            const response = await request(app)
                .get('/api/users/me')
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.email).toBe(testUser.email);
            expect(response.body.role).toBeDefined();
        });

        it('should fail without token', async () => {
            const response = await request(app).get('/api/users/me');
            expect(response.status).toBe(401);
        });
    });

    describe('PUT /api/users/profile', () => {
        it('should update profile name', async () => {
            const response = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${userToken}`)
                .field('name', 'Updated Name');
            
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Profile updated successfully');
            expect(response.body.user.name).toBe('Updated Name');
        });

        it('should update profile image', async () => {
            const testImagePath = path.join(__dirname, '../test-image.jpg');
            const response = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${userToken}`)
                .attach('image', testImagePath);
            
            expect(response.status).toBe(200);
            expect(response.body.user.image).toContain('/user_photos/');
        });
    });
});
