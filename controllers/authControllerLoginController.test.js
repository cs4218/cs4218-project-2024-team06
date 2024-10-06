import { loginController } from './authController.js';
import userModel from '../models/userModel.js';
import authHelper from './../helpers/authHelper.js';

// Mock functions
jest.mock('./../helpers/authHelper', () => ({
    comparePassword: jest.fn(async () => Promise.resolve(true))
}));


jest.mock('../models/userModel.js', () => ({
    findOne: jest.fn(async () => Promise.resolve({
        name: "James",
        email: "james",
        password: "james123_hashed",
        phone: "9123 4567",
        address: "Sentosa",
        answer: "Badminton"
    }))
}));


jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(async () => Promise.resolve("token"))
}));


// Test suite for loginController
describe('loginController', () => {
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
        it.failing('email and password are both empty', async () => {
            //ARRANGE
            const req = {
                body: {
                    email: "",
                    password: "",
                }
            };
    
            //ACTION
            await loginController(req, res);

            //ASSERT
            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({ success: false, message: "Invalid email or password" });
        });
    });


    describe('should not allow user to log in if', () => {
        let req;
        beforeEach(() => {
            req = {
                body: {
                    email: "james@gmail.com",
                    password: "james123",
                }
            };
        });


        //NEVER PASS
        it.failing('email is not registered in database', async () => {
            //ARRANGE
            userModel.findOne.mockImplementation(() => {
                return Promise.resolve(null); //Email is not found
            });

            //ACTION
            await loginController(req, res);

            //ASSERT
            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({ success: false, message: "Email is not registered" });
        });

        
        //NEVER PASS
        it.failing('password is incorrect', async () => {
            //ARRANGE
            userModel.findOne.mockImplementation(() => {
                return Promise.resolve({}); //Email is found, not null
            });
            authHelper.comparePassword.mockImplementation(() => {
                return Promise.resolve(false); //Password is incorrect
            });

            //ACTION
            await loginController(req, res);

            //ASSERT
            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({ success: false, message: "Invalid Password" });
        });

    });


    describe('should work correctly', () => {
        let req;
        
        beforeEach(() => {
            req = {
                body: {
                    email: "james@gmail.com",
                    password: "james123",
                }
            };

            //Email is found
            userModel.findOne.mockImplementation(() => {
                return Promise.resolve({
                    _id: 1,
                    name: "James",
                    email: "james@gmail.com",
                    phone: "91234567",
                    address: "Sentosa",
                    role: 1,
                });
            });

            //Password is correct
            authHelper.comparePassword.mockImplementation(() => {
                return Promise.resolve(true); 
            });

            //Reinitialise console log spy
            consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        });


        //NEVER PASS
        it.failing('where it allows log in if there is no error', async () => {
            //ARRANGE
        
            //ACTION
            await loginController(req, res);

            //ASSERT
            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({ success: true, message: "Login successful", user: {
                _id: 1,
                name: "James",
                email: "james@gmail.com",
                phone: "91234567",
                address: "Sentosa",
                role: 1,
            },
            token: "token"
            });
        });
    });
});
