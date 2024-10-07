import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';
import Order from "./orderModel.js";

const validProductId1 = new mongoose.Types.ObjectId();
const validProductId2 = new mongoose.Types.ObjectId();
const validProductId3 = new mongoose.Types.ObjectId();
const validUserId1 = new mongoose.Types.ObjectId();
const mockValidPayment1 = { "transaction": 1 };
const validStatus = ["Not Process", "Processing", "Shipped", "deliverd", "cancel"];

let mongoServer;

describe("Order Model Test", () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    const testCollectionName = "testOrders";

    beforeEach(async () => {
        await mongoose.connection.createCollection(testCollectionName);
    });

    afterEach(async () => {
        await mongoose.connection.dropCollection(testCollectionName);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    it("should save an order with default status and valid ObjectId references", async () => {
        const order = new Order({
            products: [validProductId1, validProductId2, validProductId3],
            payment: mockValidPayment1, 
            buyer: validUserId1
        });

        const savedOrder = await order.save();

        expect(savedOrder.status).toBe(validStatus[0]);

        expect(savedOrder.products[0]).toEqual(validProductId1);
        expect(savedOrder.buyer).toEqual(validUserId1);

        expect(savedOrder.createdAt).toBeDefined();
        expect(savedOrder.updatedAt).toBeDefined();
    });
});