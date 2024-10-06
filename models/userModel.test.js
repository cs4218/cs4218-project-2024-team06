import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./userModel";

require("dotenv").config();

const mockUser = new User ({
    name: "John Doe", 
    email: "some@gmail.com", 
    password: "password", 
    phone: "99999999", 
    address: "123 Main St, Springfield, IL 62701", 
    answer: "answer"
});


describe("User Model", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL + "_test");
    });

    const testCollectionName = "testUsers";

    beforeEach(async () => {
        await mongoose.connection.createCollection(testCollectionName);
    });

    afterEach(async () => {
        await mongoose.connection.dropCollection(testCollectionName);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    it("should save a user with correct information and default role", async () => {
        const savedUser = await mockUser.save();

        expect(savedUser.name).toBe(mockUser.name);
        expect(savedUser.email).toBe(mockUser.email);
        expect(savedUser.password).toBe(mockUser.password);
        expect(savedUser.phone).toBe(mockUser.phone);
        expect(savedUser.address).toBe(mockUser.address);
        expect(savedUser.answer).toBe(mockUser.answer);
        expect(savedUser.role).toBe(0);
    });
})