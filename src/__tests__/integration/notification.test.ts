import request from 'supertest';
import app from '../../app';
import { User } from '../../models/user.model';
import { Notification } from '../../models/notification.model';
import mongoose from 'mongoose';

describe('Notification Integration Tests', () => {
    let userToken: string;
    let userId: string;
    let notifId: string;

    const testUser = {
        name: 'Notif User',
        username: 'notifuser',
        email: 'notif@test.com',
        password: 'Password123!'
    };

    beforeAll(async () => {
        await User.deleteMany({ email: testUser.email });
        await Notification.deleteMany({});

        await request(app).post('/api/auth/register').send(testUser);
        const loginRes = await request(app).post('/api/auth/login').send({
            email: testUser.email,
            password: testUser.password
        });
        userToken = loginRes.body.token;
        const user = await User.findOne({ email: testUser.email });
        userId = user!._id.toString();

        // Seed a notification
        const notif = await Notification.create({
            user: userId as any,
            title: 'Test Notif',
            message: 'Hello world',
            type: 'general'
        });
        notifId = (notif as any)._id.toString();
    });

    afterAll(async () => {
        await Notification.deleteMany({});
        await User.deleteMany({ email: testUser.email });
    });

    describe('GET /api/notifications', () => {
        it('should fetch user notifications', async () => {
            const response = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('PATCH /api/notifications/mark-read', () => {
        it('should mark all notifications as read', async () => {
            const response = await request(app)
                .patch('/api/notifications/mark-read')
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            
            const updatedNotif = await Notification.findById(notifId);
            expect(updatedNotif?.isRead).toBe(true);
        });
    });

    describe('DELETE /api/notifications/:id', () => {
        it('should delete a notification', async () => {
            const response = await request(app)
                .delete(`/api/notifications/${notifId}`)
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
});
