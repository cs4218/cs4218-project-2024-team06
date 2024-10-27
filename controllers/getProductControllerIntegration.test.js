// @ts-nocheck
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import productModel from "../models/productModel";
import { getProductController } from "../controllers/productController";

let mongoServer;

describe("getProductController Integration Test", () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    
        const book = new productModel({
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
        });
    
        const notebook = new productModel({
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
        });
    
        await productModel.insertMany([book, notebook]);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

	it("should return all products from the in-memory DB", async () => {
		// Mock request and response objects
		const req = {};
		const res = {
			status: jest.fn().mockReturnThis(),
			send: jest.fn(),
		};

		// Call the controller function
		await getProductController(req, res);

		// Verify response
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith({
			success: true,
			counTotal: 2,
			message: "ALlProducts ",
			products: expect.arrayContaining([
				expect.objectContaining({
					name: "best-book",
					price: 18,
					shipping: false,
				}),
				expect.objectContaining({
					name: "smart-notebook",
					price: 25,
					shipping: true,
				}),
			]),
		});
	});
});
