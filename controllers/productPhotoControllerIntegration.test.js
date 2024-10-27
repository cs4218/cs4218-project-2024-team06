// @ts-nocheck
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import productModel from "../models/productModel";
import { productPhotoController } from "../controllers/productController";

let mongoServer;

describe("productPhotoController Integration Test", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // Create a sample product with photo data
    const product = new productModel({
      name: "sample-product",
      slug: "sample-product-slug",
      description: "A sample product for testing",
      price: 20,
      category: new mongoose.Types.ObjectId(),
      quantity: 1,
      photo: {
        data: Buffer.from("sample photo data", "utf-8"),
        contentType: "image/jpeg",
      },
      shipping: false,
    });

    await product.save();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it("should return the photo with correct content type", async () => {
    const sampleProduct = await productModel.findOne({ name: "sample-product" });

    const req = {
      params: {
        pid: sampleProduct._id,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      set: jest.fn(),
      send: jest.fn(),
    };

    await productPhotoController(req, res);

    expect(res.set).toHaveBeenCalledWith("Content-type", "image/jpeg");
    expect(res.status).toHaveBeenCalledWith(200);
    const expectedBuffer = Buffer.from("sample photo data", "utf-8");
    expect(Buffer.compare(res.send.mock.calls[0][0], expectedBuffer)).toBe(0);
  });
});
