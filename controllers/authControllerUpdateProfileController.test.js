import { updateProfileController } from "./authController.js";
import { hashPassword } from "../helpers/authHelper.js";
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

    it("should keep old profile if new profile fields are empty or null", async () => {
        req.body = {
            name: "",
            email: null,
            password: "",
            address: null,
            phone: ""
        };

        let updatedUser = JSON.parse(JSON.stringify(oldProfileUpdate));
        expect(hashPassword).not.toHaveBeenCalled();
        userModel.findByIdAndUpdate.mockReturnValueOnce(updatedUser);

        await updateProfileController(req, res);
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
});