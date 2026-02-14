import request from 'supertest';
import app from '../../app';
import { User } from '../../models/user.model';
import { Product } from '../../models/product.model';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

describe('Product Integration Tests', () => {
    let authToken: string;
    let userId: string;
    let productId: string;
    const testImagePath = path.join(__dirname, '../test-image.jpg');

    const testUser = {
        name: 'Product Tester',
        username: 'prodtester',
        email: 'prod@test.com',
        password: 'Password123!',
        role: 'user'
    };

    const testProduct = {
        name: 'Test Sneaker',
        description: 'A great test sneaker',
        price: 150,
        brand: 'Nike',
        condition: 'new'
    };

    // Global cleanup before all tests
    beforeAll(async () => {
        // Ensure clean state
        await User.deleteMany({ email: testUser.email });
        await Product.deleteMany({});
        
        // Register and login to get token
        await request(app).post('/api/auth/register').send(testUser);
        const loginRes = await request(app).post('/api/auth/login').send({
            email: testUser.email, 
            password: testUser.password
        });
        
        authToken = loginRes.body.token;
        
        // Decode token to get user ID if needed, or query DB
        const user = await User.findOne({ email: testUser.email });
        userId = user!._id.toString();
        
        // Ensure dummy image exists
        if (!fs.existsSync(testImagePath)) {
            fs.writeFileSync(testImagePath, 'dummy content');
        }
    });

    // Clean up after all tests
    afterAll(async () => {
        await User.deleteMany({ email: testUser.email });
        await Product.deleteMany({});
        if (fs.existsSync(testImagePath)) {
            // Optional: delete dummy file (commented out to keep file for manual testing)
            // fs.unlinkSync(testImagePath);
        }
    });

    describe('POST /api/products', () => {
        it('should create a new product when authenticated', async () => {
            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${authToken}`)
                .field('name', testProduct.name)
                .field('description', testProduct.description)
                .field('price', testProduct.price)
                .field('brand', testProduct.brand)
                .field('condition', testProduct.condition)
                .attach('image', testImagePath); // Use .attach for files

            expect(response.status).toBe(201);
            expect(response.body.product).toHaveProperty('name', testProduct.name);
            
            productId = response.body.product._id; // Save ID for later tests
        });

        it('should fail to create product without authentication', async () => {
            const response = await request(app)
                .post('/api/products')
                .send({});
            
            expect(response.status).toBe(401);
        });

        it('should fail to create product with missing required fields (Image)', async () => {
             
            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${authToken}`)
                .field('name', 'No Image Sneaker')
                .field('price', 100);
            
            // Your controller checks `if (!image) return 400`
            expect(response.status).toBe(400); 
        });
    });

    describe('GET /api/products', () => {
        it('should fetch all products', async () => {
            const response = await request(app)
                .get('/api/products');
            
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/products/:id', () => {
        it('should fetch a single product by ID', async () => {
            const response = await request(app)
                .get(`/api/products/${productId}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('_id', productId);
            expect(response.body).toHaveProperty('name', testProduct.name);
        });

        it('should return 404 for non-existent product ID', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .get(`/api/products/${fakeId}`);
            
            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/products/:id', () => {
         it('should update a product successfully', async () => {
            const response = await request(app)
                .put(`/api/products/${productId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .field('price', 200)
                .field('name', 'Updated Sneaker')
                .attach('image', testImagePath); // Sending image again as update might expect it
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('price', 200);
            expect(response.body).toHaveProperty('name', 'Updated Sneaker');
        });

        it('should fail to update product if not owner (simulated by new user)', async () => {
             // Create another user
             const otherUser = { ...testUser, email: 'other@test.com', username: 'other' };
             await request(app).post('/api/auth/register').send(otherUser);
             const otherLogin = await request(app).post('/api/auth/login').send({
                 email: otherUser.email, password: otherUser.password
             });
             const otherToken = otherLogin.body.token;

             const response = await request(app)
                .put(`/api/products/${productId}`)
                .set('Authorization', `Bearer ${otherToken}`)
                .field('price', 500)
                .attach('image', testImagePath);

             // Assuming you have ownership checks in place, this should fail
             expect(response.status).toBe(403);

             // Cleanup other user
             await User.deleteMany({ email: otherUser.email });
        });
    });

    describe('DELETE /api/products/:id', () => {
        it('should delete a product successfully', async () => {
            const response = await request(app)
                .delete(`/api/products/${productId}`)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200); // Or 204
            
            // Verify it's gone
            const getResponse = await request(app).get(`/api/products/${productId}`);
            expect(getResponse.status).toBe(404);
        });
    });
});
