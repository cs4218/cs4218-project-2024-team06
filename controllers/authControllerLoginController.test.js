import { loginController } from './authController.js';
import userModel from '../models/userModel.js';
import { describe } from 'node:test';
import authHelper from './../helpers/authHelper.js';
import JWT from "jsonwebtoken";

// Mock functions
jest.mock('./../helpers/authHelper', () => ({
    comparePassword: jest.fn(async (passwordToCheck, correctPassword) => Promise.resolve(true))
}));


jest.mock('../models/userModel.js', () => ({
    findOne: jest.fn(async (inputQuery) => Promise.resolve({
        name: "James",
        email: "james",
        password: "james123_hashed",
        phone: "9123 4567",
        address: "Sentosa",
        answer: "Badminton"
    }))
}));


jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(async (userId, environmentKey, expirationDate) => Promise.resolve("token"))
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
        it('email is empty', async () => {
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
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({ success: false, message: "Invalid email or password" });
        });


        it('password is empty', async () => {
            //ARRANGE
            const req = {
                body: {
                    email: "james@gmail.com",
                    password: "",
                }
            };
    
            //ACTION
            await loginController(req, res);

            //ASSERT
            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(404);
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
        it('email is not registered in database', async () => {
            //ARRANGE
            userModel.findOne.mockImplementation((queryInput) => {
                return Promise.resolve(null); //Email is not found
            });

            //ACTION
            await loginController(req, res);

            //ASSERT
            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({ success: false, message: "Email is not registered" });
        });

        
        //NEVER PASS
        it('password is incorrect', async () => {
            //ARRANGE
            userModel.findOne.mockImplementation((queryInput) => {
                return Promise.resolve({}); //Email is found, not null
            });
            authHelper.comparePassword.mockImplementation((passwordToCheck, correctPassword) => {
                return Promise.resolve(false); //Password is incorrect
            });

            //ACTION
            await loginController(req, res);

            //ASSERT
            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({ success: false, message: "Invalid Password" });
        });

    });


    describe('should work correctly', () => {
        let req;
        let consoleLogSpy;
        
        beforeEach(() => {
            req = {
                body: {
                    email: "james@gmail.com",
                    password: "james123",
                }
            };

            //Email is found
            userModel.findOne.mockImplementation((queryInput) => {
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
            authHelper.comparePassword.mockImplementation((passwordToCheck, correctPassword) => {
                return Promise.resolve(true); 
            });

            //Reinitialise console log spy
            consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        });


        afterEach(() => {
            //Restore original functionality of console.log
            consoleLogSpy.mockRestore();
        });


        //NEVER PASS
        it('where it allows user to log in if there is no error', async () => {
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


        it('where it denies log in if there is an error', async () => {
            //ARRANGE
            const error = new Error('Exception during login');
            JWT.sign.mockImplementation((userId, environmentKey, expirationDate) => {
                throw error;
            });

            //ACTION
            await loginController(req, res);

            //ASSERT
            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({success: false, message: "Error in login", error});
            expect(consoleLogSpy).toHaveBeenCalledWith(error);
        });
    });


});
