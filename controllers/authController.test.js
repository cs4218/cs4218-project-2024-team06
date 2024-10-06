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


describe("updateProfileController", () => {
    beforeAll(() => {
        hashPassword.mockReturnValue(passwordHash);
        userModel.findById.mockReturnValue(oldProfile);
        userModel.findByIdAndUpdate.mockImplementation(() => jest.fn());
    })

    beforeEach(() => {
        jest.clearAllMocks();
        req.body = JSON.parse(JSON.stringify(newProfile));
    });

    it("should update user's profile", async () => {
        userModel.findByIdAndUpdate.mockReturnValueOnce(newProfileUpdate);
        await updateProfileController(req, res);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(req.user._id, newProfileUpdate, { new: true });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: true, updatedUser: newProfileUpdate }));
    });

    it("should update user's profile with new password of length 6", async () => {
        req.body.password = passwordLen6;

        let updatedUser = JSON.parse(JSON.stringify(newProfileUpdate));
        updatedUser.password = passwordHash;

        userModel.findByIdAndUpdate.mockReturnValueOnce(updatedUser);

        await updateProfileController(req, res);

        expect(userModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(req.user._id, updatedUser, { new: true });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: true, updatedUser }));
    });

    it("should not update user's profile with new password of less than length 6", async () => {
        req.body.password = passwordLen5;

        await updateProfileController(req, res);

        expect(hashPassword).not.toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledTimes(1);
    });

    it("should keep old password if new password is null", async () => {
        req.body.password = null;

        let updatedUser = JSON.parse(JSON.stringify(newProfileUpdate));
        updatedUser.password = "safePassword";

        userModel.findByIdAndUpdate.mockReturnValueOnce(updatedUser);
        
        await updateProfileController(req, res);
        
        expect(hashPassword).not.toHaveBeenCalled();
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(req.user._id, updatedUser, { new: true });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: true, updatedUser }));
    });

    it("should keep old password if hashpassword fails", async () => {
        hashPassword.mockReturnValueOnce(undefined);

        let updatedUser = JSON.parse(JSON.stringify(newProfileUpdate));
        updatedUser.password = "safePassword";

        userModel.findByIdAndUpdate.mockReturnValueOnce(updatedUser);
        
        await updateProfileController(req, res);
        
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(req.user._id, updatedUser, { new: true });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: true, updatedUser }));
    });

    it("should not update empty password and empty phone fields", async () => {
        req.body = {
            name: sampleName,
            email: "",
            password: "",
            address: validAddress,
            phone: ""
        };

        let updatedUser = JSON.parse(JSON.stringify(oldProfileUpdate));
        updatedUser.name = sampleName;
        updatedUser.address = validAddress;

        userModel.findByIdAndUpdate.mockReturnValueOnce(updatedUser);
        
        await updateProfileController(req, res);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(req.user._id, updatedUser, { new: true });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: true, updatedUser }));
    })

    it("should not update empty name and empty address fields", async () => {
        req.body = {
            name: "",
            email: sampleEmail,
            password: passwordLenMoreThan6,
            address: "",
            phone: validPhone
        };

        let updatedUser = JSON.parse(JSON.stringify(oldProfileUpdate));
        updatedUser.password = passwordHash;
        updatedUser.phone = validPhone;
        userModel.findByIdAndUpdate.mockReturnValueOnce(updatedUser);
        
        await updateProfileController(req, res);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(req.user._id, updatedUser, { new: true });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: true, updatedUser }));
    })

    it("should keep old profile if new profile is empty", async () => {
        req.body = {
            name: "",
            email: "",
            password: "",
            address: "",
            phone: ""
        };

        let updatedUser = JSON.parse(JSON.stringify(oldProfileUpdate));
        userModel.findByIdAndUpdate.mockReturnValueOnce(updatedUser);

        await updateProfileController(req, res);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(req.user._id, updatedUser, { new: true });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: true, updatedUser }));
    });

    it("should keep old profile if new profile has null fields", async () => {
        req.body = {
            name: null,
            email: null,
            password: null,
            address: null,
            phone: null
        };

        const updatedUser = JSON.parse(JSON.stringify(oldProfileUpdate));
        userModel.findByIdAndUpdate.mockReturnValueOnce(updatedUser);
        
        await updateProfileController(req, res);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(req.user._id, updatedUser, { new: true });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: true, updatedUser }));
    });

    /**
     * This test will fail as there is currently no validation for phone number in original code.
     * Updating phone number with invalid strings like "abc" should not work but the original code allows it.
     */
    it.failing("should not update profile with invalid phone number", async () => {
        req.body = {
            name: sampleName,
            email: sampleEmail,
            password: passwordLenMoreThan6,
            address: validAddress,
            phone: invalidPhone
        };

        await updateProfileController(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should catch error if findById fails", async () => {
        userModel.findById.mockRejectedValueOnce(new Error("findById failed"));
        await updateProfileController(req, res);
        expect(hashPassword).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should catch error if findByIdAndUpdate fails", async () => {
        userModel.findByIdAndUpdate.mockRejectedValueOnce(new Error("findByIdAndUpdate failed"));
        await updateProfileController(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });
});

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

    it("should catch error thrown by find", async () => {
        const mockedFindError = new Error("find failed");
        orderModel.find.mockImplementation(() => {
            throw mockedFindError;
        });
        await getOrdersController(req, res);
        expect(orderModel.find).toHaveBeenCalledTimes(1);
        expect(orderModel.find).toHaveBeenCalledWith({ buyer: req.user._id });
        expect(orderModel.populate).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: false, error: mockedFindError }));
    });

    it("should catch error thrown by first populate function", async () => {
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

    it("should catch error thrown by second populate function", async () => {
        const mockedPopulateError = new Error("second populate failed");
        orderModel.find.mockReturnValue(orderModel);
        orderModel.populate
            .mockReturnValueOnce(orderModel)
            .mockImplementation(() => {
                throw mockedPopulateError;
            });
        await getOrdersController(req, res);
        expect(orderModel.find).toHaveBeenCalledTimes(1);
        expect(orderModel.find).toHaveBeenCalledWith({ buyer: req.user._id });
        expect(orderModel.populate).toHaveBeenCalledTimes(2);
        expect(orderModel.populate).toHaveBeenNthCalledWith(1, firstPopulateParams[0], firstPopulateParams[1]);
        expect(orderModel.populate).toHaveBeenNthCalledWith(2, secondPopulateParams[0], secondPopulateParams[1]);
        expect(res.json).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: false, error: mockedPopulateError }));
    });
});

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

    it("should catch error thrown by find", async () => {
        const mockedFindError = new Error("find failed");
        orderModel.find.mockImplementation(() => {
            throw mockedFindError;
        });
        await getAllOrdersController(req, res);
        expect(orderModel.find).toHaveBeenCalledTimes(1);
        expect(orderModel.find).toHaveBeenCalledWith({});
        expect(orderModel.populate).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: false, error: mockedFindError }));
    });

    it("should catch error thrown by first populate function", async () => {
        const mockedPopulateError = new Error("first populate failed");
        orderModel.populate.mockImplementation(() => {
            throw mockedPopulateError;
        });
        await getAllOrdersController(req, res);
        expect(orderModel.find).toHaveBeenCalledTimes(1);
        expect(orderModel.find).toHaveBeenCalledWith({});
        expect(orderModel.populate).toHaveBeenCalledTimes(1);
        expect(orderModel.populate).toHaveBeenCalledWith(firstPopulateParams[0], firstPopulateParams[1]);
        expect(res.json).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: false, error: mockedPopulateError }));
    });

    it("should catch error thrown by second populate function", async () => {
        const mockedPopulateError = new Error("second populate failed");
        orderModel.populate
            .mockReturnValueOnce(orderModel)
            .mockImplementation(() => {
                throw mockedPopulateError;
            });
        await getAllOrdersController(req, res);
        expect(orderModel.find).toHaveBeenCalledTimes(1);
        expect(orderModel.find).toHaveBeenCalledWith({});
        expect(orderModel.populate).toHaveBeenCalledTimes(2);
        expect(orderModel.populate).toHaveBeenNthCalledWith(1, firstPopulateParams[0], firstPopulateParams[1]);
        expect(orderModel.populate).toHaveBeenNthCalledWith(2, secondPopulateParams[0], secondPopulateParams[1]);
        expect(res.json).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: false, error: mockedPopulateError }));
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

    it("should handle findByIdAndUpdate error", async () => {
        const mockedError = new Error("findByIdAndUpdate failed");
        orderModel.findByIdAndUpdate.mockRejectedValueOnce(mockedError);
        await orderStatusController(req, res);
        expect(orderModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith(req.params.orderId, { status: req.body.status }, { new: true });
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: false, error: mockedError }));
    });

    afterAll(() => {
        req.params = { orderId: "mockedOrderId" };
        req.body = { status: "Processing" };
    });
});