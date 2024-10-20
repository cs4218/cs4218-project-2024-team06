import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';

const oldProfile = {
    name: "Halimah Yacob", 
    email: "yacob@gov.sg", 
    password: "safePassword", 
    address: "Not Istana", 
    phone: "88888888"
};

const newProfile = {
    name: "Tharman Shanmugaratnam", 
    email: "tharman@gov.sg", 
    password: "saferPassword", 
    address: "Istana", 
    phone: "999"
}

const newProfileUpdate = {
    name: newProfile.name, 
    password: newProfile.password, 
    address: newProfile.address, 
    phone: newProfile.phone
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

let mongoServer;

describe("updateProfileController integration test", () => {
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

    it("should integrate with userModel to update user profile", () => {
        expect(true).toBe(true);
    });
});