/**
 * updateProfileController() uses findById(), hashPassword() and findByIdAndUpdate(). Thus, this 
 * integration test should only be concerned with the integration between updateProfileController()
 * and these 3 things. As such, there will not be testing of the prevention of update when password 
 * is less than 6 characters as this is a unit test concern of updateProfileController() and lies 
 * outside the scope of this integration test.
 */

import bcrypt from "bcrypt";
import { hashPassword } from "../helpers/authHelper";
import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { updateProfileController } from "./authController";
import userModel from "../models/userModel";

const originalProfile = new userModel({
    name: "Halimah Yacob", 
    email: "yacob@gov.sg", 
    password: "safePassword", 
    phone: "88888888", 
    address: "Not Istana", 
    answer: "safeAnswer", 
    role: 1
});

const newProfileUpdate = {
    name: "Tharman Shanmugaratnam", 
    email: "tharman@gov.sg", 
    password: "saferPassword", 
    address: "Istana", 
    phone: "999"
};

const req = {
    body: newProfileUpdate, 
    user: { _id: originalProfile._id }, 
    params: { orderId: "mockedOrderId" }
};

const res = {
    json: jest.fn(),
    status: jest.fn(() => res),
    send: jest.fn()
};

let mongoServer;

describe("updateProfileController integration test", () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    const testCollectionName = "testUsers";

    beforeEach(async () => {
        await mongoose.connection.createCollection(testCollectionName);
        await originalProfile.save();
    });

    afterEach(async () => {
        await mongoose.connection.dropCollection(testCollectionName);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    it("should integrate with userModel and hashPassword() to update user profile", async () => {
        await updateProfileController(req, res);

        const newProfileAllowedUpdate = {
            name: newProfileUpdate.name, 
            password: await hashPassword(newProfileUpdate.password), 
            phone: newProfileUpdate.phone
        };

        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: true }));

        const updatedUser = await userModel.findById(originalProfile._id);

        expect(updatedUser.name).toBe(newProfileUpdate.name);
        expect(updatedUser.email).toBe(originalProfile.email);
        expect(await bcrypt.compare(newProfileUpdate.password, updatedUser.password)).toBe(true);
        expect(updatedUser.phone).toBe(newProfileUpdate.phone);
        expect(updatedUser.address).toBe(newProfileUpdate.address);
        expect(updatedUser.answer).toBe(originalProfile.answer);
        expect(updatedUser.role).toBe(originalProfile.role);
    });
});