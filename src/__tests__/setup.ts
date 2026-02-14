import { connectDBTest, closeDBTest } from "../database";

beforeAll(async () => {
    await connectDBTest();
});

afterAll(async () => {
    await closeDBTest();
});