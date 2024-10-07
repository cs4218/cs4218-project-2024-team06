import { getOrdersController } from "./authController.js";
import orderModel from "../models/orderModel.js";

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

const mockProduct3 = {
    name: "M3 Macbook Air",
    slug: "M3 Macbook Air",
    description: "Apple's lightest laptop.",
    price: 3000, 
    category: { name: "Laptop" },
    quantity: 10,
    photo: {
        data: null, 
        contentType: "mockedContent"
    },
    shipping: true
};

const mockProduct4 = {
    name: "Leobog Hi75",
    slug: "Leobog Hi75",
    description: "Thocky keyboard.",
    price: 40, 
    category: { name: "Mechanical Keyboard" },
    quantity: 1,
    shipping: true
}

const mockUser1 = {
    name: "Halimah Yacob"
}

const mockOrder1 = {
    products: [mockProduct1, mockProduct2],
    buyer: mockUser1, 
    status: "Not Process"
}

const mockOrder2 = {
    products: [mockProduct3, mockProduct4], 
    buyer: mockUser1, 
    status: "Shipped"
}

const sameUserOrderArray = [mockOrder1, mockOrder2];
const emptyOrderArray = [];
const firstPopulateParams = ["products", "-photo"];
const secondPopulateParams = ["buyer", "name"];


describe("getOrdersController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should respond with all the orders from requested buyer", async () => {
        orderModel.find.mockReturnValue(orderModel);
        orderModel.populate.mockReturnValueOnce(orderModel).mockReturnValue(sameUserOrderArray);
        await getOrdersController(req, res);
        expect(orderModel.find).toHaveBeenCalledTimes(1);
        expect(orderModel.find).toHaveBeenCalledWith({ buyer: req.user._id });
        expect(orderModel.populate).toHaveBeenCalledTimes(2);
        expect(orderModel.populate).toHaveBeenNthCalledWith(1, firstPopulateParams[0], firstPopulateParams[1]);
        expect(orderModel.populate).toHaveBeenNthCalledWith(2, secondPopulateParams[0], secondPopulateParams[1]);
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith(sameUserOrderArray);
    });

    it("should respond with empty array if requested buyer has no orders", async () => {
        orderModel.find.mockReturnValue(orderModel);
        orderModel.populate.mockReturnValueOnce(orderModel).mockReturnValue(emptyOrderArray);
        await getOrdersController(req, res);
        expect(orderModel.find).toHaveBeenCalledTimes(1);
        expect(orderModel.find).toHaveBeenCalledWith({ buyer: req.user._id });
        expect(orderModel.populate).toHaveBeenCalledTimes(2);
        expect(orderModel.populate).toHaveBeenNthCalledWith(1, firstPopulateParams[0], firstPopulateParams[1]);
        expect(orderModel.populate).toHaveBeenNthCalledWith(2, secondPopulateParams[0], secondPopulateParams[1]);
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith(emptyOrderArray);
    });

    it("should handle errors thrown gracefully", async () => {
        const mockedPopulateError = new Error("first populate failed");
        orderModel.find.mockReturnValue(orderModel);
        orderModel.populate.mockImplementation(() => {
            throw mockedPopulateError;
        });
        await getOrdersController(req, res);
        expect(orderModel.find).toHaveBeenCalledTimes(1);
        expect(orderModel.find).toHaveBeenCalledWith({ buyer: req.user._id });
        expect(orderModel.populate).toHaveBeenCalledTimes(1);
        expect(orderModel.populate).toHaveBeenCalledWith(firstPopulateParams[0], firstPopulateParams[1]);
        expect(res.json).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: false, error: mockedPopulateError }));
    });
});