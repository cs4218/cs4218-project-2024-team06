import { getAllOrdersController, getOrdersController, updateProfileController } from "./authController.js";
import { hashPassword } from "../helpers/authHelper.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { hash } from "crypto";
import { describe } from "node:test";

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
    params: "mockParams"
}

const res = {
    json: jest.fn(),
    status: jest.fn(() => res),
    send: jest.fn()
};

jest.mock("./../helpers/authHelper.js", () => ({
    hashPassword: jest.fn()
}));


// Tests for updateProfileController
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
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ updatedUser: newProfileUpdate }));
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
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ updatedUser }));
    });

    it("should not update user's profile with new password of less than length 6", async () => {
        req.body.password = passwordLen5;

        await updateProfileController(req, res);

        expect(hashPassword).toHaveBeenCalledTimes(0);
        expect(res.json).toHaveBeenCalledTimes(1);
    });

    it("should keep old password if new password is null", async () => {
        req.body.password = null;

        let updatedUser = JSON.parse(JSON.stringify(newProfileUpdate));
        updatedUser.password = "safePassword";

        userModel.findByIdAndUpdate.mockReturnValueOnce(updatedUser);
        
        await updateProfileController(req, res);
        
        expect(hashPassword).toHaveBeenCalledTimes(0);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(req.user._id, updatedUser, { new: true });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ updatedUser }));
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
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ updatedUser }));
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
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ updatedUser }));
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
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ updatedUser }));
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

        await updateProfileController(req, res);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(req.user._id, updatedUser, { new: true });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledTimes(1);
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
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ updatedUser }));
    });

    /**
     * This test will fail as there is currently no validation for phone number in original code.
     * Updating phone number with invalid strings like "abc" should not work but the original code allows it.
     */
    it("should not update profile with invalid phone number", async () => {
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
        expect(hashPassword).toHaveBeenCalledTimes(0);
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

const sameUserOrderList = [mockOrder1, mockOrder3];

// Tests for getOrdersController
describe("getOrdersController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        req.body = JSON.parse(JSON.stringify(newProfile));
    });

    it("should respond with all the orders from requested buyer", async () => {
        orderModel.find.mockReturnValue({
            populate: jest.fn(() => ({
                populate: jest.fn(() => sameUserOrderList)
            }))
        });
        await getOrdersController(req, res);
        expect(orderModel.find).toHaveBeenCalledTimes(1);
        expect(orderModel.find).toHaveBeenCalledWith({ buyer: req.user._id });
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith(sameUserOrderList);
    });
});

// Tests for orderStatusController
// describe("orderStatusController", () => {
//     beforeAll(() => {
//         console.log()
//     });
// })