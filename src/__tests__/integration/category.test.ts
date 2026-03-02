import request from 'supertest';
import app from '../../app';
import { Category } from '../../models/category.model';
import mongoose from 'mongoose';

describe('Category Integration Tests', () => {
    
    const testCategory = {
        name: 'Test Category',
        description: 'Testing categories'
    };

    beforeAll(async () => {
        await Category.deleteMany({});
    });

    afterAll(async () => {
        await Category.deleteMany({});
    });

    describe('POST /api/categories', () => {
        it('should create a new category', async () => {
            const response = await request(app)
                .post('/api/categories')
                .send(testCategory);
            
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(testCategory.name);
            expect(response.body.data.slug).toBe('test-category');
        });

        it('should fail if category already exists', async () => {
            const response = await request(app)
                .post('/api/categories')
                .send(testCategory);
            
            expect(response.status).toBe(500); // Controller uses 500 for error.message
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/categories', () => {
        it('should fetch all categories', async () => {
            const response = await request(app).get('/api/categories');
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('POST /api/categories/seed', () => {
        it('should seed default categories', async () => {
            const response = await request(app).post('/api/categories/seed');
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Categories seeded successfully');
            
            const count = await Category.countDocuments({ slug: { $in: ['new', 'thrift'] } });
            expect(count).toBe(2);
        });
    });
});
