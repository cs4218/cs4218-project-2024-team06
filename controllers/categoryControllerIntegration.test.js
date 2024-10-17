import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import categoryModel from "../models/categoryModel";
import { categoryControlller } from "./categoryController";

let mongoServer;

describe('category controller integration tests', () => {
    let req, res;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);

        const categoryData = { name: "Electronics", slug: "electronics" };
        const category = new categoryModel(categoryData);
        const savedCategory = await category.save();
        
        const categoryTwoData = { name: "Books", slug: "books" };
        const categoryTwo = new categoryModel(categoryTwoData);
        const savedCategoryTwo = await categoryTwo.save();
    });

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('should get all categories in the database', async () => {
        await categoryControlller(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                message: "All Categories List",
                category: expect.arrayContaining([
                    expect.objectContaining({ name: "Electronics", slug: "electronics" }),
                    expect.objectContaining({ name: "Books", slug: "books" })
                ])
            })
        );
    });
});