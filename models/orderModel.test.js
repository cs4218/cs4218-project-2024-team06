import dotenv from "dotenv";
import mongoose from "mongoose";
import Order from "./orderModel.js";

require("dotenv").config();

const validProductId1 = new mongoose.Types.ObjectId();
const validProductId2 = new mongoose.Types.ObjectId();
const validProductId3 = new mongoose.Types.ObjectId();
const validUserId1 = new mongoose.Types.ObjectId();
const validUserId2 = new mongoose.Types.ObjectId();
const validUserId3 = new mongoose.Types.ObjectId();
const mockValidPayment1 = { "transaction": 1 };
const mockValidPayment2 = { "transaction": 2 };
const mockValidPayment3 = { "transaction": 3 };
const validStatus = ["Not Process", "Processing", "Shipped", "deliverd", "cancel"];
const invalidStatus = "Teleporting";

describe("Order Model Test", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
    });

    const testCollectionName = "testOrders";

    beforeEach(async () => {
        await mongoose.connection.createCollection(testCollectionName);
    });

    afterEach(async () => {
        await mongoose.connection.dropCollection(testCollectionName);
    });

    afterAll(async () => {
        await mongoose.connection.close();
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

    it("should only allow statuses in the enum", async () => {
        const validOrder = new Order({
            products: [validProductId1, validProductId2],
            buyer: validUserId2,
            payment: mockValidPayment2,
            status: validStatus[4]
        });

        const invalidOrder = new Order({
            products: [validProductId1], 
            buyer: validUserId2, 
            payment: mockValidPayment2, 
            status: invalidStatus
        });

        let error;

        try {
            await validOrder.save();
        } catch (err) {
            error = err;
        }

        expect(error).not.toBeDefined();
        error = undefined;

        try {
            await invalidOrder.save();
        } catch (err) {
            error = err;
        }

        // Ensure an error was thrown for invalid status
        expect(error).toBeDefined();
        expect(error.errors["status"].message).toContain(`\`${invalidStatus}\` is not a valid enum value for path \`status\`.`);
    });

    /**
     * This test is failing as the model is not validating fields that should be required like 
     * products, buyer, and payment. The payment field is not included in this test as it has been 
     * shown in the first test that a missing payment field will have payment set to "Not Process" 
     * by default.
     */
    it.failing("should not create an order with missing information", async () => {
        const orderWithMissingProducts = new Order({
            buyer: validUserId3, 
            payment: mockValidPayment3, 
            status: validStatus[1]
        });

        const orderWithEmptyProductsArray = new Order({
            products: [], 
            buyer: validUserId3, 
            payment: mockValidPayment3, 
            status: validStatus[2]
        });

        const orderWithMissingBuyer = new Order({
            products: [validProductId1, validProductId2], 
            payment: mockValidPayment3, 
            status: validStatus[3]
        });

        const orderWithMissingPayment = new Order({
            products: [validProductId1, validProductId2], 
            buyer: validUserId3, 
            status: validStatus[4]
        });

        let error;

        try {
            await orderWithMissingProducts.save();
        } catch (err) {
            error = err;
        }

        expect(error).toBeDefined();
        expect(error.errors["products"]).toBeDefined();
        error = undefined;

        try {
            await orderWithEmptyProductsArray.save();
        } catch (err) {
            error = err;
        }
        expect(error).toBeDefined();
        expect(error.errors["products"]).toBeDefined();
        error = undefined;

        try {
            await orderWithMissingBuyer.save();
        } catch (err) {
            error = err;
        }
        expect(error).toBeDefined();
        expect(error.errors["buyer"]).toBeDefined();
        error = undefined;

        try {
            await orderWithMissingPayment.save();
        } catch (err) {
            error = err;
        }
        expect(error).toBeDefined();
        expect(error.errors["payment"]).toBeDefined();
    });
});