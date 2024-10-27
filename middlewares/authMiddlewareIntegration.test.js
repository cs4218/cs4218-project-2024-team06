import { isAdmin } from './authMiddleware.js';
import userModel from "../models/userModel.js";
import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server'

/**
This integration test focuses on the isAdmin middleware in authMiddleware.

The isAdmin middleware uses the userModel which acts an interface to the users
collection in the MongoDB database. In unit testing, we mocked the userModel. Thus,
in integration testing, we want to assess if the isAdmin middleware can successful
integrate with userModel to retrieve data from the backend.

My choice is to set up an in-memory MongoDB database as the test database so everytime the
test runs, the data can be reset.

Note that I mocked req, res and next() because these are not the components that I am trying to
perform integration testing on. In isAdmin middleware, I am trying to integrate it with userModel
to assess if data can be fetched from the backend, and thus, req, res and next() are not the focus
of integration testing which is to test whether different components can work together.
*/
describe('isAdmin Middleware should successfully integrate with user model in the backend', () => {
    let mongodbServer;
    let userCollectionName = 'users'
    let req, res, next;

    const user_id = new mongoose.Types.ObjectId().toHexString();


    beforeEach(async () => {
        //Reset all mocks
        jest.clearAllMocks();

        //Set up default values for req, res and next
        req = {
            headers: { authorization: 'token' },
            user: { _id: user_id }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(), 
        };
        next= jest.fn();


        //Create the in-memory MongoDB server and connect to it
        mongodbServer = await MongoMemoryServer.create();
        const mongodbUri = mongodbServer.getUri();
        await mongoose.connect(mongodbUri);

        //Create a user collection to work with
        await mongoose.connection.createCollection(userCollectionName);
    });


    afterEach(async () => {
        //Reset the collection
        await mongoose.connection.dropCollection(userCollectionName);

        //Reset the database
        await mongoose.connection.dropDatabase();

        //Disconnect from the in-memory MongoDB server
        await mongoose.disconnect();
        await mongodbServer.stop();
    });


    //NEVER PASS
    //Typo in Line 25 of authMiddleware.js where the capitalisation of the message is incorrect
    it.failing('where it should be able to fetch a non-admin user', async () => {
        //Insert a non-admin into the mongodb in-memory server
        const nonAdminUser = new userModel({
            name: 'James',
            email: 'james@gmail.com',
            password: 'password',
            phone: '91234567',
            address: 'Sentosa',
            answer: 'Badminton',
            role: 0,
            _id: user_id
        })
        await nonAdminUser.save();


        const result = await isAdmin(req, res, next);

        //Assert
        expect(result).toBe(undefined);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith(({
            success: false,
            message: 'Unauthorized Access'
        }));
        expect(next).toHaveBeenCalledTimes(0);
    });
});
