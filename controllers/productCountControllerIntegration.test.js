// @ts-nocheck
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import productModel from "../models/productModel";
import { productCountController } from "../controllers/productController";

let mongoServer;

describe("productCountController Integration Test", () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);

        // Insert sample products
        const products = [
            new productModel({
                name: "best-book",
                slug: "book-slug",
                description: "this is the best book",
                price: 18,
                category: new mongoose.Types.ObjectId(),
                quantity: 1,
                photo: {
                    data: Buffer.from("sample photo data", "utf-8"),
                    contentType: "image/jpeg",
                },
                shipping: false,
            }),
            new productModel({
                name: "smart-notebook",
                slug: "notebook-slug",
                description: "a notebook with AI features",
                price: 25,
                category: new mongoose.Types.ObjectId(),
                quantity: 2,
                photo: {
                    data: Buffer.from("sample notebook data", "utf-8"),
                    contentType: "image/png",
                },
                shipping: true,
            }),
        ];

        await productModel.insertMany(products);  // Insert sample products
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    it("should return the total product count", async () => {
        // Mock request and response objects
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

        // Call the controller function
        await productCountController(req, res);

        // Verify response
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            total: 2,  // Verify the count is correct
        });
    });
});
