import { describe } from "node:test";
import { hashPassword } from "../helpers/authHelper.js";
import { updateProfileController } from "./authController";
import userModel from "../models/userModel";

const oldProfile = {
  name: "Halimah Yacob",
  email: "yacob@gov.sg",
  password: "safePassword",
  address: "Istana, Orchard Road, Singapore 238823",
  phoneNumber: "999"
};

const validName = "John Doe";
const validEmail = "johndoe@gmail.com";
const invalidEmailNoName = "@gmail.com";
const invalidEmailNoAt = "johndoegmail.com";
const invalidEmailNoDomain = "johndoe@gmail";
const passwordLenMoreThan6 = "password";
const passwordLen6 = "passwo";
const passwordLen5 = "passw";
const passwordHash = "hashedPassword";
const validAddress = "123 Main St, Springfield, IL 62701";
const validPhone = "99999999";
const invalidPhone = "abc";
const emptyString = "";

const newProfile = {
    name: validName, 
    email: validEmail, 
    password: passwordLenMoreThan6, 
    address: validAddress, 
    phone: validPhone
}

jest.mock('../models/userModel.js', () => ({
    findById: jest.fn(() => oldProfile), 
    // findByIdAndUpdate: jest.fn((user_id, updatedProfile, newDocument) => {
    //     return {
    //         name: updatedProfile.name || oldProfile.name,
    //         email: updatedProfile.email || oldProfile.email,
    //         password: updatedProfile.password || oldProfile.password,
    //         address: updatedProfile.address || oldProfile.address,
    //         phoneNumber: updatedProfile.phoneNumber || oldProfile.phoneNumber
    //     }
    // })
    findByIdAndUpdate: jest.fn()
}));

const req = {
    body: JSON.parse(JSON.stringify(newProfile)), 
    user: { _id: "123" }
}

const res = {
    json: jest.fn(),
    status: jest.fn(() => res),
    send: jest.fn()
};

jest.mock("./../helpers/authHelper.js", () => ({
    hashPassword: jest.fn((_) => passwordHash)
}));

describe("updateProfileController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should update user's profile", async () => {
        await updateProfileController(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledTimes(1);
    });

    it("should update user's profile with new password of length 6", async () => {
        req.body.password = passwordLen6;
        await updateProfileController(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledTimes(1);
    })

    it("should not update user's profile new password of less than length 6", async () => {
        req.body.password = passwordLen5;
        await updateProfileController(req, res);
        expect(res.json).toHaveBeenCalledTimes(1);
    })

    it("should keep old profile if new profile is empty", async () => {
        // req.body = {};
    })
});