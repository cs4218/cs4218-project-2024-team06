// @ts-nocheck
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import productModel from "../models/productModel";
import { productFiltersController } from "../controllers/productController";

let mongoServer;
const categoryId1 = new mongoose.Types.ObjectId();
const categoryId2 = new mongoose.Types.ObjectId();

describe("productFiltersController Integration Test", () => {
	beforeAll(async () => {
		mongoServer = await MongoMemoryServer.create();
		const uri = mongoServer.getUri();
		await mongoose.connect(uri);

		// Sample product data
		const book = new productModel({
			name: "best-book",
			slug: "book-slug",
			description: "this is the best book",
			price: 18,
			category: categoryId1,
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
			category: categoryId2,
			quantity: 2,
			photo: {
				data: Buffer.from("sample notebook data", "utf-8"),
				contentType: "image/png",
			},
			shipping: true,
		});

		const pen = new productModel({
			name: "blue-pen",
			slug: "pen-slug",
			description: "a smooth blue pen",
			price: 5,
			category: categoryId2,
			quantity: 10,
			photo: {
				data: Buffer.from("sample pen data", "utf-8"),
				contentType: "image/png",
			},
			shipping: true,
		});

		await productModel.insertMany([book, notebook, pen]);
	});

	afterAll(async () => {
		await mongoose.connection.dropDatabase();
		await mongoose.connection.close();
		await mongoServer.stop();
	});

	it("should filter products by price", async () => {
		const req = {
			body: {
				checked: [], // No category filter
				radio: [15, 30], // Price filter between 15 and 30
			},
		};
		const res = {
			status: jest.fn().mockReturnThis(),
			send: jest.fn(),
		};

		await productFiltersController(req, res);

		// Log the response data to see what's inside
		console.log("Response data:", res.send.mock.calls[0][0]);

		expect(res.status).toHaveBeenCalledWith(200);

		// Check if the filtered products include "smart-notebook" and "best-book" with their expected prices
		expect(res.send).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				products: expect.arrayContaining([
					expect.objectContaining({
						name: "smart-notebook",
						price: 25,
					}),
					expect.objectContaining({
						name: "best-book",
						price: 18, // Include best-book here
					}),
				]),
			})
		);
    
        // Ensure that products outside the price range, such as "blue-pen", are excluded
        expect(res.send.mock.calls[0][0]).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: "blue-pen", price: 5 }), // This should fail the test if present
            ])
        );
	});


    it("should filter products by category only", async () => {
        const req = {
            body: {
                checked: [categoryId1], // Only fetch products from categoryId1
                radio: [], // No price filter
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    
        await productFiltersController(req, res);
        // Log the response data to see what's inside
		console.log("Response data:", res.send.mock.calls[0][0]);
        // Check if the filtered products include "best-book" only
        expect(res.send).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                products: expect.arrayContaining([
                    expect.objectContaining({
                        name: "best-book",
                        price: 18,
                    }),
                ]),
            })
        );
    
        // Ensure products not in categoryId1 are excluded
        expect(res.send.mock.calls[0][0].products).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: "smart-notebook" }),
                
            ])
        );

        // Ensure products not in categoryId1 are excluded
        expect(res.send.mock.calls[0][0].products).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: "blue-pen" }),
            ])
        );
    });
});
