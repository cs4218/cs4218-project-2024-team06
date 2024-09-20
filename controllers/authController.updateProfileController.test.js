import { hashPassword } from "../helpers/authHelper.js";
import { updateProfileController } from "./authController.js";
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
    user: { _id: "123" }
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
        await updateProfileController(req, res);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(req.user._id, newProfileUpdate, { new: true });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledTimes(1);
    });

    it("should update user's profile with new password of length 6", async () => {
        req.body.password = passwordLen6;

        let updatedUser = JSON.parse(JSON.stringify(newProfileUpdate));
        updatedUser.password = passwordHash;

        await updateProfileController(req, res);

        expect(userModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(req.user._id, updatedUser, { new: true });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledTimes(1);
    });

    it("should not update user's profile with new password of less than length 6", async () => {
        req.body.password = passwordLen5;

        await updateProfileController(req, res);

        // expect(hashPassword).toHaveBeenCalledTimes(0);
        expect(res.json).toHaveBeenCalledTimes(1);
    });

    it("should keep old password if new password is null", async () => {
        req.body.password = null;

        let updatedUser = JSON.parse(JSON.stringify(newProfileUpdate));
        updatedUser.password = "safePassword";

        await updateProfileController(req, res);

        // expect(hashPassword).toHaveBeenCalledTimes(0);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(req.user._id, updatedUser, { new: true });
    });

    it("should keep old password if hashpassword fails", async () => {
        hashPassword.mockReturnValueOnce(undefined);

        let updatedUser = JSON.parse(JSON.stringify(newProfileUpdate));
        updatedUser.password = "safePassword";

        await updateProfileController(req, res);

        // expect(hashPassword).toHaveBeenCalledTimes(1);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(req.user._id, updatedUser, { new: true });
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

        await updateProfileController(req, res);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(req.user._id, updatedUser, { new: true });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledTimes(1);
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

        await updateProfileController(req, res);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(req.user._id, updatedUser, { new: true });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledTimes(1);
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

        let updatedUser = JSON.parse(JSON.stringify(oldProfileUpdate));

        await updateProfileController(req, res);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(req.user._id, updatedUser, { new: true });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledTimes(1);
    });

    // This test will fail as there is currently no validation for phone number in original code.
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
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should catch error if findByIdAndUpdate fails", async () => {
        userModel.findByIdAndUpdate.mockRejectedValueOnce(new Error("findByIdAndUpdate failed"));
        await updateProfileController(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });
});