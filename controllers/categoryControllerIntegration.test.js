import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import categoryModel from "../models/categoryModel";
import { categoryControlller, singleCategoryController } from "./categoryController";

let mongoServer;

describe('category controller integration tests', () => {
    let req, res;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);

        await new categoryModel({ name: "Electronics", slug: "electronics" }).save();
        await new categoryModel({ name: "Books", slug: "books" }).save();
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

    test.failing('should get a single category in the database', async () => {
        req = { params: { slug: 'books' } };

        await singleCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(
            expect.objectContaining({
                category: expect.objectContaining({
                    name: "Books",
                    slug: "books"
                }),
                message: "Get single category successfully",
                success: true
            })
        );
    });
});