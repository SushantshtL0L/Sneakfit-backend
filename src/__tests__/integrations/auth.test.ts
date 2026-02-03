import request from 'supertest';
import { User as UserModel } from '../../models/user.model';

describe(
    'Authentication Integration Tests', // descibe test suite
    () => { // what to run 
        const testUser = { // according to your UserModel
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123',
            username: 'testuser'
        }
        beforeAll(async () => {
            await UserModel.deleteMany({ email: testUser.email });
        });
        afterAll(async () => {
            await UserModel.deleteMany({ email: testUser.email });
        });
    }
);