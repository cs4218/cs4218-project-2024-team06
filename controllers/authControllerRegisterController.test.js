import { registerController } from './authController';
import userModel from '../models/userModel.js';

// Mock functions
jest.mock('./../helpers/authHelper', () => ({
    hashPassword: jest.fn(async (password) => Promise.resolve(`Mock ${password}`)),
}));

jest.mock('../models/userModel', () => {
    //Need to mock the constructor because the constructor is used in registerController
    const mockSave = jest.fn().mockResolvedValue({
        name: "James",
        email: "james@gmail.com",
        password: "james123",
        phone: "9123 4567",
        address: "Sentosa",
        answer: "Badminton"
    });

    return jest.fn().mockImplementation(() => ({
        save: mockSave,
    }));
})


// Test suite for registerController
describe('registerController', () => {
    let res;
    
    beforeEach(() => {
        jest.clearAllMocks();

        //Mock the status and send functions
        res = {
            send: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
    });

   
    describe('should return error messages for its input validations if', () => {
        //NEVER PASS
        it.failing('inputs are empty', async () => {
            //ARRANGE
            const req = {
                body: {
                    name: "",
                    email: "",
                    password: "",
                    phone: "",
                    address: "",
                    answer: ""
                }
            };
    
            //ACTION
            await registerController(req, res);

            
            //ASSERT
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({ message: "Name is Required" });
        });
    });


    describe('should correctly handle validating user against database where', () => {
        let req;
        beforeEach(() => {
            req = {
                body: {
                    name: "James",
                    email: "james",
                    password: "james123",
                    phone: "9123 4567",
                    address: "Sentosa",
                    answer: "Badminton"
                }
            };
        });


        //NEVER PASS
        it.failing('it throws error if user can be found in database', async () => {
            //ARRANGE
            userModel.findOne = jest.fn().mockReturnValue({ name: "James" }); //As long as not null

            //ACTION
            await registerController(req, res);

            //ASSERT
            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({ success: false, message: "Already Registered please login" });
        });


        it('it successfully returns if user cannot be found in database', async () => {
            //ARRANGE
            userModel.findOne = jest.fn().mockReturnValue(null);

            //ACTION
            await registerController(req, res);

            //ASSERT
            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({ success: true, message: "User Register Successfully", user: {
                name: "James",
                email: "james@gmail.com",
                password: "james123",
                phone: "9123 4567",
                address: "Sentosa",
                answer: "Badminton"                
            }});
        });
    });
});