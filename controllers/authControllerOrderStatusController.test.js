import orderModel from "../models/orderModel.js";
import { orderStatusController } from "./authController.js";

jest.mock("../models/userModel.js");

const req = {
    body: {}, 
    user: { _id: "123" }, 
    params: { orderId: "mockedOrderId" }
}

const res = {
    json: jest.fn(),
    status: jest.fn(() => res),
    send: jest.fn()
};

jest.mock("./../helpers/authHelper.js", () => ({
    hashPassword: jest.fn()
}));

jest.mock("../models/orderModel.js");

const mockProduct1 = {
    name: "iphone 16",
    slug: "iphone 16",
    description: "Apple's latest smartphone.",
    price: 2000, 
    category: { name: "Smartphone" },
    quantity: 3,
    photo: {
        data: null, 
        contentType: "mockedContent"
    },
    shipping: true
};

const mockProduct2 = {
    name: "s24",
    slug: "s24",
    description: "Samsung's latest smartphone.",
    price: 1000, 
    category: { name: "Smartphone" },
    quantity: 5,
    photo: {
        data: null, 
        contentType: "mockedContent"
    },
    shipping: true
};

const mockUser1 = {
    name: "Halimah Yacob"
}

const mockOrder1 = {
    products: [mockProduct1, mockProduct2],
    buyer: mockUser1, 
    status: "Not Process"
}

describe("orderStatusController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        req.params = { orderId: "mockedOrderId" };
        req.body = { status: "Processing" };
    });

    it("should update order status", async () => {
        let updatedOrder = JSON.parse(JSON.stringify(mockOrder1));
        updatedOrder.status = req.body.status;
        orderModel.findByIdAndUpdate.mockReturnValue(updatedOrder);
        await orderStatusController(req, res);
        expect(orderModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith(req.params.orderId, { status: req.body.status }, { new: true });
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith(updatedOrder);
    });

    it("should handle findByIdAndUpdate error", async () => {
        req.body = { status: null };
        const mockedValidationError = new Error("\"null\" not valid enum value for \"status\"");
        orderModel.findByIdAndUpdate.mockRejectedValueOnce(mockedValidationError);
        await orderStatusController(req, res);
        expect(orderModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith(req.params.orderId, { status: null }, { new: true });
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: false, error: mockedValidationError }));
    });

    afterAll(() => {
        req.params = { orderId: "mockedOrderId" };
        req.body = { status: "Processing" };
    });
});