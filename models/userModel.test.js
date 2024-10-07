import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from "./userModel";

let mongoServer;

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
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
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
        await mongoose.disconnect();
        await mongoServer.stop();
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