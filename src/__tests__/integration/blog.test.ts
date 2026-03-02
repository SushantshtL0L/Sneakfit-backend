import request from 'supertest';
import app from '../../app';
import { User } from '../../models/user.model';
import { Blog } from '../../models/blog.model';
import mongoose from 'mongoose';

describe('Blog Integration Tests', () => {
    let adminToken: string;
    let userToken: string;
    let blogId: string;

    const adminUser = {
        name: 'Admin User',
        username: 'blogadmin',
        email: 'blogadmin@test.com',
        password: 'Password123!',
        role: 'admin'
    };

    const regularUser = {
        name: 'Regular User',
        username: 'bloguser',
        email: 'bloguser@test.com',
        password: 'Password123!',
        role: 'user'
    };

    beforeAll(async () => {
        await User.deleteMany({ email: { $in: [adminUser.email, regularUser.email] } });
        await Blog.deleteMany({});

        // Register Admin (hash password correctly)
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(adminUser.password, 10);
        await User.create({ ...adminUser, password: hashedPassword });
        
        const adminLogin = await request(app).post('/api/auth/login').send({
            email: adminUser.email,
            password: adminUser.password
        });
        adminToken = adminLogin.body.token;

        // Register Regular User via API
        await request(app).post('/api/auth/register').send(regularUser);
        const userLogin = await request(app).post('/api/auth/login').send({
            email: regularUser.email,
            password: regularUser.password
        });
        userToken = userLogin.body.token;
    });

    afterAll(async () => {
        await Blog.deleteMany({});
        await User.deleteMany({ email: { $in: [adminUser.email, regularUser.email] } });
    });

    describe('POST /api/blogs', () => {
        it('should allow admin to create a blog', async () => {
            const response = await request(app)
                .post('/api/blogs')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'New Sneaker Trends',
                    content: 'Kicks are getting cooler.',
                    category: 'Trends'
                });
            
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            blogId = response.body.data._id;
        });

        it('should forbid regular user from creating a blog', async () => {
            const response = await request(app)
                .post('/api/blogs')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    title: 'My Favorite Shoes',
                    content: 'I love shoes.',
                    category: 'Personal'
                });
            
            expect(response.status).toBe(403);
        });
    });

    describe('GET /api/blogs', () => {
        it('should fetch all blogs for public', async () => {
            const response = await request(app).get('/api/blogs');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('DELETE /api/blogs/:id', () => {
        it('should allow admin to delete a blog', async () => {
            const response = await request(app)
                .delete(`/api/blogs/${blogId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
});
