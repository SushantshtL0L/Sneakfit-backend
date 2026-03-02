import request from 'supertest';
import app from '../../app';
import { User } from '../../models/user.model';
import { Product } from '../../models/product.model';
import { Order } from '../../models/order.model';
import mongoose from 'mongoose';
import path from 'path';

describe('Order Integration Tests', () => {
    let userToken: string;
    let userId: string;
    let productId: string;
    let orderId: string;

    const testUser = {
        name: 'Order User',
        username: 'orderuser',
        email: 'order@test.com',
        password: 'Password123!'
    };

    const testProduct = {
        name: 'Orderable Sneaker',
        description: 'Sneaker to order',
        price: 99,
        brand: 'Puma',
        condition: 'new'
    };

    beforeAll(async () => {
        await User.deleteMany({ email: testUser.email });
        await Product.deleteMany({ name: testProduct.name });
        await Order.deleteMany({});

        // Create user
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(testUser.password, 10);
        await User.create({ ...testUser, password: hashedPassword });
        
        const loginRes = await request(app).post('/api/auth/login').send({
            email: testUser.email,
            password: testUser.password
        });
        userToken = loginRes.body.token;
        const user = await User.findOne({ email: testUser.email });
        userId = user!._id.toString();

        // Create product
        const testImagePath = path.join(__dirname, '../test-image.jpg');
        const prodRes = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${userToken}`)
            .field('name', testProduct.name)
            .field('description', testProduct.description)
            .field('price', testProduct.price)
            .field('brand', testProduct.brand)
            .field('condition', testProduct.condition)
            .attach('image', testImagePath);
        
        productId = prodRes.body.product._id;
    });

    afterAll(async () => {
        await Order.deleteMany({});
        await Product.deleteOne({ _id: productId });
        await User.deleteMany({ email: testUser.email });
    });

    describe('POST /api/orders', () => {
        it('should create an order successfully', async () => {
            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    items: [{ 
                        product: productId, 
                        quantity: 1,
                        name: testProduct.name,
                        price: testProduct.price,
                        size: '8',
                        image: 'test-image.jpg'
                    }],
                    shippingAddress: {
                        fullName: 'John Doe',
                        address: '123 Sneaker St',
                        city: 'Sneaker City',
                        phone: '1234567890'
                    },
                    paymentMethod: 'khalti',
                    totalAmount: 99
                });
            
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            orderId = response.body.data._id;
        });
    });

    describe('GET /api/orders/my-orders', () => {
        it('should fetch user orders', async () => {
            const response = await request(app)
                .get('/api/orders/my-orders')
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/orders/all', () => {
        it('should fetch all orders for management', async () => {
            const response = await request(app)
                .get('/api/orders/all')
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('PUT /api/orders/cancel/:id', () => {
        it('should cancel an order', async () => {
            const response = await request(app)
                .put(`/api/orders/cancel/${orderId}`)
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
});
