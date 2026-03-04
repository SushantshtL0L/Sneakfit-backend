import request from 'supertest';
import app from '../../app';
import { User } from '../../models/user.model';
import { Product } from '../../models/product.model';
import { Review } from '../../models/review.model';
import mongoose from 'mongoose';
import path from 'path';

describe('Review Integration Tests', () => {
    let authToken: string;
    let userId: string;
    let productId: string;
    let reviewId: string;

    const testUser = {
        name: 'Reviewer',
        username: 'reviewer1',
        email: 'reviewer@test.com',
        password: 'Password123!',
        role: 'user'
    };

    const testProduct = {
        name: 'Reviewable Sneaker',
        description: 'A sneaker to be reviewed',
        price: 120,
        brand: 'Adidas',
        condition: 'new'
    };

    beforeAll(async () => {
        await User.deleteMany({ email: testUser.email });
        await Product.deleteMany({ name: testProduct.name });
        await Review.deleteMany({});

        // Create user
        await request(app).post('/api/auth/register').send(testUser);
        const loginRes = await request(app).post('/api/auth/login').send({
            email: testUser.email,
            password: testUser.password
        });
        authToken = loginRes.body.token;
        const user = await User.findOne({ email: testUser.email });
        userId = user!._id.toString();

        // Create product (Need image for validation in product creation)
        const testImagePath = path.join(__dirname, '../test-image.jpg');
        const prodRes = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${authToken}`)
            .field('name', testProduct.name)
            .field('description', testProduct.description)
            .field('price', testProduct.price)
            .field('brand', testProduct.brand)
            .field('condition', testProduct.condition)
            .attach('image', testImagePath);
        
        productId = prodRes.body.product._id;
    });

    afterAll(async () => {
        await Review.deleteMany({});
        await Product.deleteOne({ _id: productId });
        await User.deleteMany({ email: testUser.email });
    });

    describe('POST /api/reviews', () => {
        it('should create a review successfully', async () => {
            const response = await request(app)
                .post('/api/reviews')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    product: productId,
                    rating: 5,
                    comment: 'Love these sneakers!'
                });
            
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.comment).toBe('Love these sneakers!');
            reviewId = response.body.data._id;
        });

        it('should fail to create review without auth', async () => {
            const response = await request(app)
                .post('/api/reviews')
                .send({
                    product: productId,
                    rating: 4,
                    comment: 'No auth test'
                });
            
            expect(response.status).toBe(401);
        });

        it('should fail if rating is invalid (e.g., 6)', async () => {
            const response = await request(app)
                .post('/api/reviews')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    product: productId,
                    rating: 6,
                    comment: 'Bad rating'
                });
            
            expect(response.status).toBeGreaterThanOrEqual(400); 
        });

        it('should fail if required fields are missing', async () => {
            const response = await request(app)
                .post('/api/reviews')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    product: productId
                });
            
            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Missing required fields");
        });
    });

    describe('GET /api/reviews/product/:productId', () => {
        it('should fetch reviews for a product', async () => {
            const response = await request(app)
                .get(`/api/reviews/product/${productId}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });

        it('should return empty list for product with no reviews', async () => {
            const fakeProdId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .get(`/api/reviews/product/${fakeProdId}`);
            
            expect(response.status).toBe(200);
            expect(response.body.data).toEqual([]);
        });
    });

    describe('DELETE /api/reviews/:id', () => {
        it('should fail if unauthorized user tries to delete review', async () => {
             // Create another user
             const otherUser = { name: 'Other', username: 'otherreviewer', email: 'otherrev@test.com', password: 'Password123!' };
             await request(app).post('/api/auth/register').send(otherUser);
             const otherLogin = await request(app).post('/api/auth/login').send({
                 email: otherUser.email, password: otherUser.password
             });
             const otherToken = otherLogin.body.token;

             const response = await request(app)
                .delete(`/api/reviews/${reviewId}`)
                .set('Authorization', `Bearer ${otherToken}`);

             expect(response.status).toBe(403);
             expect(response.body.message).toBe("Unauthorized to delete this review");

             // Cleanup
             const { User } = require('../../models/user.model');
             await User.deleteOne({ email: otherUser.email });
        });

        it('should return 404 for non-existent review', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .delete(`/api/reviews/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(404);
        });

        it('should delete a review successfully', async () => {
            const response = await request(app)
                .delete(`/api/reviews/${reviewId}`)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
});
