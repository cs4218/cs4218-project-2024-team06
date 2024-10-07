import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Category from './categoryModel';

let mongoServer;

describe('Category Model', () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('should create and save a category succesfully', async () => {
        const categoryData = { name: 'Test', slug: 'test-slug' };
        const validCategory = new Category(categoryData);
        const savedCategory = await validCategory.save();

        expect(savedCategory._id).toBeDefined();
        expect(savedCategory.name).toBe(categoryData.name);
        expect(savedCategory.slug).toBe(categoryData.slug);
    });
});