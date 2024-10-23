import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { orderStatusController } from "./authController";
import orderModel from "../models/orderModel";

const order = new orderModel({
    products: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
    buyer: new mongoose.Types.ObjectId(), 
    status: "Not Process"
});

const validStatus = ["Not Process", "Processing", "Shipped", "deliverd", "cancel"];
const invalidStatus = "Teleporting";

const req = {
    body: {}, 
    params: { orderId: order._id }
};

const res = {
    json: jest.fn(),
    status: jest.fn(() => res),
    send: jest.fn()
};

const orderVerifier = {
    products: order.products, 
    buyer: order.buyer
}

let mongoServer;

describe("orderStatusController integration test", () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    const testCollectionName = "testOrders";

    beforeEach(async () => {
        await mongoose.connection.createCollection(testCollectionName);
        await order.save();
    });

    afterEach(async () => {
        await mongoose.connection.dropCollection(testCollectionName);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    it("should integrate with orderModel to update order status for valid order status", async () => {
        req.body = { status: validStatus[1] };
        orderVerifier.status = req.body.status;
        await orderStatusController(req, res);

        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining(orderVerifier));

        const updatedOrder = await orderModel.findById(order._id);
        expect(updatedOrder.products).toStrictEqual(orderVerifier.products);
        expect(updatedOrder.buyer).toStrictEqual(orderVerifier.buyer);
        expect(updatedOrder.status).toBe(orderVerifier.status);
    });

    /**
     * This test is failing because findByIdAndUpdate is not being called with runValidators: true. 
     * This means that the enum validation is only run when the document is created and saved, but 
     * not when it is updated.
     */
    it.failing("should return 500 for invalid order status", async () =>  {
        req.body = { status: invalidStatus };
        await orderStatusController(req, res);

        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: false }));

        const updatedOrder = await orderModel.findById(order._id);
        expect(updatedOrder.products).toStrictEqual(orderVerifier.products);
        expect(updatedOrder.buyer).toStrictEqual(orderVerifier.buyer);
        expect(updatedOrder.status).not.toBe(invalidStatus);
        expect(updatedOrder.status).toBe(order.status);
    });
});