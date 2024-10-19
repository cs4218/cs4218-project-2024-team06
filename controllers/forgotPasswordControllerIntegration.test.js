import { forgotPasswordController } from './authController.js';
import userModel from '../models/userModel.js';
import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server'
import bcrypt from "bcrypt";

/**
The forgotPassword controller uses userModel to access and update user data in the database. It also calls
the helper function hashPassword from authHelper.

Purpose of this integration test is to test the integration of forgotPassword controller with:
- userModel (represents the backend database)
- hashPassword()

In particular, we want to see if forgotPasswordController can successfully retrieve and update user's
password in the database.
*/
describe('forgotPasswordController should integrate with userModel', () => {
    let mongodbServer;
    let userCollectionName = 'users';


    beforeEach(async () => {
        //Reset all mocks
        jest.clearAllMocks();

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


    it('where user data can be successfully fetched to check if user exists, and update user data', async () => {
        //Set up the request and response
        let newPassword = "new password";
        let req =  {
            body: {
                email: "james@gmail.com",
                answer: "Badminton",
                newPassword: newPassword
            }
        };

        let res = {
            send: jest.fn(),
            status: jest.fn().mockReturnThis()
        };


        //Insert a user into the mongodb in-memory server to use during test
        const newUser = new userModel({
            name: 'James',
            email: 'james@gmail.com',
            password: 'password',
            phone: '91234567',
            address: 'Sentosa',
            answer: 'Badminton',
            role: 0,
        });
        await newUser.save();


        //Run the forgotPassword controller
        await forgotPasswordController(req, res);


        //Assert that success control flow is achieved
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ success: true, message: "Password Reset Successfully" });

        //Assert that user's password has indeed been updated in the database
        const updatedUser = await userModel.findById(newUser._id);
        const doPasswordsMatch = await bcrypt.compare(newPassword, updatedUser.password);
        expect(doPasswordsMatch).toBe(true);
    });
});
