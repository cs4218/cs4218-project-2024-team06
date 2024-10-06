import { getAllOrdersController, getOrdersController, updateProfileController, orderStatusController } from "./authController.js";
import { hashPassword } from "../helpers/authHelper.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

jest.mock("../models/userModel.js");

const oldProfile = {
    name: "Halimah Yacob", 
    email: "yacob@gov.sg", 
    password: "safePassword", 
    address: "Istana, Orchard Road, Singapore 238823", 
    phone: "999"
};

const oldProfileUpdate = {
    name: "Halimah Yacob", 
    password: "safePassword", 
    address: "Istana, Orchard Road, Singapore 238823", 
    phone: "999"
}

const sampleName = "John Doe";
const sampleEmail = "johndoe@gmail.com";
const passwordLenMoreThan6 = "password";
const passwordLen6 = "passwo";
const passwordLen5 = "passw";
const passwordHash = "hashedPassword";
const validAddress = "123 Main St, Springfield, IL 62701";
const validPhone = "99999999";
const invalidPhone = "abc";

const newProfile = {
    name: sampleName, 
    email: sampleEmail, 
    password: passwordLenMoreThan6, 
    address: validAddress, 
    phone: validPhone
}

const newProfileUpdate = {
    name: sampleName, 
    password: passwordHash, 
    address: validAddress, 
    phone: validPhone
}

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

const sameUserOrderArray = [mockOrder1, mockOrder3];
const emptyOrderArray = [];
const firstPopulateParams = ["products", "-photo"];
const secondPopulateParams = ["buyer", "name"];

const allOrdersArray = [mockOrder1, mockOrder2, mockOrder3, mockOrder4, mockOrder5];
const sortParams = { createdAt: "-1" };

describe("orderStatusController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        req.params = { orderId: "mockedOrderId" };
        req.body = { status: "Processing" };
    });

    it("should update order status", async () => {
        let updatedOrder = JSON.parse(JSON.stringify(mockOrder1));
        updatedOrder.status = "Processing";
        orderModel.findByIdAndUpdate.mockReturnValue(updatedOrder);
        await orderStatusController(req, res);
        expect(orderModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith(req.params.orderId, { status: req.body.status }, { new: true });
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith(updatedOrder);
    });

    it("should should handle orderId not found", async () => {
        orderModel.findByIdAndUpdate.mockReturnValue(null);
        await orderStatusController(req, res);
        expect(orderModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith(req.params.orderId, { status: req.body.status }, { new: true });
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith(null);
    })

    it("should handle null req.params", async () => {
        req.params = null;
        await orderStatusController(req, res);
        expect(orderModel.findByIdAndUpdate).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it("should handle null orderId", async () => {
        req.params = { orderId: null };
        orderModel.findByIdAndUpdate.mockReturnValue(null);
        await orderStatusController(req, res);
        expect(orderModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith(null, { status: req.body.status }, { new: true });
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith(null);
    })

    it("should handle null req.body", async () => {
        req.body = null;
        await orderStatusController(req, res);
        expect(orderModel.findByIdAndUpdate).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it("should handle null order status", async () => {
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

    // it("should handle findByIdAndUpdate error", async () => {
    //     const mockedError = new Error("findByIdAndUpdate failed");
    //     orderModel.findByIdAndUpdate.mockRejectedValueOnce(mockedError);
    //     await orderStatusController(req, res);
    //     expect(orderModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    //     expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith(req.params.orderId, { status: req.body.status }, { new: true });
    //     expect(res.status).toHaveBeenCalledTimes(1);
    //     expect(res.status).toHaveBeenCalledWith(500);
    //     expect(res.send).toHaveBeenCalledTimes(1);
    //     expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: false, error: mockedError }));
    // });

    afterAll(() => {
        req.params = { orderId: "mockedOrderId" };
        req.body = { status: "Processing" };
    });
});