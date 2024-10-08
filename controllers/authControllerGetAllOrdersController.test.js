import { getAllOrdersController } from "./authController.js";
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

const mockUser2 = {
    name: "Tony Tan"
}

const mockUser3 = {
    name: "SR Nathan"
}

const mockUser4 = {
    name: "Tharman Shanmugaratnam"
}

const mockOrder1 = {
    products: [mockProduct1, mockProduct2],
    buyer: mockUser1, 
    status: "Not Process"
}

const mockOrder2 = {
    products: [mockProduct1, mockProduct3],
    buyer: mockUser2, 
    status: "Processing"
}

const mockOrder3 = {
    products: [mockProduct3, mockProduct4], 
    buyer: mockUser1, 
    status: "Shipped"
}

const mockOrder4 = {
    products: [mockProduct2, mockProduct3, mockProduct4], 
    buyer: mockUser3, 
    status: "deliverd"
}

const mockOrder5 = {
    products: [mockProduct1, mockProduct2, mockProduct3, mockProduct4], 
    buyer: mockUser4, 
    status: "cancel"
}

const emptyOrderArray = [];
const firstPopulateParams = ["products", "-photo"];
const secondPopulateParams = ["buyer", "name"];

const allOrdersArray = [mockOrder1, mockOrder2, mockOrder3, mockOrder4, mockOrder5];
const sortParams = { createdAt: "-1" };


describe("getAllOrdersController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        orderModel.find.mockReturnValue(orderModel);
    });

    it("should respond with all orders from all buyers", async () => {
        orderModel.populate
            .mockReturnValueOnce(orderModel)
            .mockReturnValue({ sort: jest.fn().mockReturnValue(allOrdersArray) });
        await getAllOrdersController(req, res);
        expect(orderModel.find).toHaveBeenCalledTimes(1);
        expect(orderModel.find).toHaveBeenCalledWith({});
        expect(orderModel.populate).toHaveBeenCalledTimes(2);
        expect(orderModel.populate).toHaveBeenNthCalledWith(1, firstPopulateParams[0], firstPopulateParams[1]);
        expect(orderModel.populate).toHaveBeenNthCalledWith(2, secondPopulateParams[0], secondPopulateParams[1]);
        expect(orderModel.populate().sort).toHaveBeenCalledTimes(1);
        expect(orderModel.populate().sort).toHaveBeenCalledWith(sortParams);
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith(allOrdersArray);
    });

    it("should respond with empty array if there are no orders", async () => {
        orderModel.populate
            .mockReturnValueOnce(orderModel)
            .mockReturnValue({ sort: jest.fn().mockReturnValue(emptyOrderArray) });
        await getAllOrdersController(req, res);
        expect(orderModel.find).toHaveBeenCalledTimes(1);
        expect(orderModel.find).toHaveBeenCalledWith({});
        expect(orderModel.populate).toHaveBeenCalledTimes(2);
        expect(orderModel.populate).toHaveBeenNthCalledWith(1, firstPopulateParams[0], firstPopulateParams[1]);
        expect(orderModel.populate).toHaveBeenNthCalledWith(2, secondPopulateParams[0], secondPopulateParams[1]);
        expect(orderModel.populate().sort).toHaveBeenCalledTimes(1);
        expect(orderModel.populate().sort).toHaveBeenCalledWith(sortParams);
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith(emptyOrderArray);
    });

    it("should catch error thrown by sort", async () => {
        const mockedSortError = new Error("sort failed");
        orderModel.populate
            .mockReturnValueOnce(orderModel)
            .mockReturnValue({ sort: jest.fn(() => { throw mockedSortError; }) });
        await getAllOrdersController(req, res);
        expect(orderModel.find).toHaveBeenCalledTimes(1);
        expect(orderModel.find).toHaveBeenCalledWith({});
        expect(orderModel.populate).toHaveBeenCalledTimes(2);
        expect(orderModel.populate).toHaveBeenNthCalledWith(1, firstPopulateParams[0], firstPopulateParams[1]);
        expect(orderModel.populate).toHaveBeenNthCalledWith(2, secondPopulateParams[0], secondPopulateParams[1]);
        expect(orderModel.populate().sort).toHaveBeenCalledTimes(1);
        expect(res.json).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: false, error: mockedSortError }));
    });
});