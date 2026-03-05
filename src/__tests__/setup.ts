import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDBTest, closeDBTest } from "../database";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await connectDBTest(uri);
});

afterAll(async () => {
    await closeDBTest();
    if (mongoServer) {
        await mongoServer.stop();
    }
});