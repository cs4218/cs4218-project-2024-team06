import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./userModel";

require("dotenv").config();

const mockUser1 = new User ({
    name: "John Doe", 
    email: "some@gmail.com", 
    password: "password", 
    phone: "99999999", 
    address: "123 Main St, Springfield, IL 62701", 
    answer: "answer", 
    role: 1
});

const mockUserWithDuplicateEmail1 = new User({
    name: "Halimah Yacob", 
    email: "sg@gov.sg", 
    password: "safepassword", 
    phone: "99999998", 
    address: "Istana", 
    answer: "some answer", 
    role: 0
});

const mockUserWithDuplicateEmail2 = new User({
    name: "Tharman Shanmugaratnam", 
    email: "sg@gov.sg", 
    password: "saferpassword", 
    phone: "99999997", 
    address: "Istana", 
    answer: "another answer", 
    role: 1
});

const invalidUser = new User({
    email: "johndoe@example.com"
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

    it("should create and save a user successfully", async () => {
        const savedUser = await mockUser1.save();

        expect(savedUser.toJSON()).toMatchObject(mockUser1.toJSON())
    });

    it("should default unstated role field to 0 and enforce unique email validation", async () => {
        const userWithDuplicateEmail1 = await mockUserWithDuplicateEmail1.save();

        expect(userWithDuplicateEmail1.role).toBe(0);

        let error;
        try {
            await mockUserWithDuplicateEmail2.save();
        } catch (err) {
            error = err;
        }

        expect(error).toBeDefined();
        expect(error.keyValue.email).toBe(mockUserWithDuplicateEmail1.email);
    });

    it("should throw validation error for missing required fields", async () => {
        let error;
        try {
            await invalidUser.save();
        } catch (err) {
            error = err;
        }

        expect(error).toBeDefined();
        expect(error.errors.name).toBeDefined();
        expect(error.errors.password).toBeDefined();
        expect(error.errors.phone).toBeDefined();
        expect(error.errors.address).toBeDefined();
        expect(error.errors.answer).toBeDefined();
    });
})