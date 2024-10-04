import { forgotPasswordController } from './authController.js';
import userModel from '../models/userModel.js';

// Mock functions
jest.mock('./../helpers/authHelper', () => ({
    hashPassword: jest.fn(async (password) => Promise.resolve(`Mock ${password}`)),
}));

jest.mock('../models/userModel.js', () => ({
    findOne: jest.fn(async () => Promise.resolve({
        _id: 1,
        name: "James",
        email: "james",
        password: "james123_hashed",
        phone: "9123 4567",
        address: "Sentosa",
        answer: "Badminton"
    })),
    findByIdAndUpdate: jest.fn()
}));


// Test suite for forgotPasswordController
describe('forgotPasswordController', () => {
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
        it.failing('email, answer and new password are all empty', async () => {
            //ARRANGE
            const req = {
                body: {
                    email: "",
                    answer: "",
                    newPassword: "",
                }
            };
    
            //ACTION
            await forgotPasswordController(req, res);

            //ASSERT
            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.send).toHaveBeenCalledWith({ message: "Email is required" });
        });
    });


    describe('should prevent password reset if', () => {
        let req;
        let consoleLogSpy;

        beforeEach(() => {
            req = {
                body: {
                    email: "james@gmail.com",
                    answer: "badminton",
                    newPassword: "password",
                }
            };

            //Reinitialise console log spy
            consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        });

        afterEach(() => {
            //Restore original functionality of console.log
            consoleLogSpy.mockRestore();
        });


        it('the given email and answer do not exist as a pair in the database', async () => {
            //ARRANGE
            userModel.findOne.mockImplementation(() => {
                return Promise.resolve(null); //Cannot find a user
            });

            //ACTION
            await forgotPasswordController(req, res);

            //ASSERT
            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({ success: false, message: "Wrong Email Or Answer" });
        });


        it('there was an exception raised during the password reset process', async() => {
            //ARRANGE
            const error = new Error('Exception during password reset');
            userModel.findOne.mockImplementation(() => {
                throw error;
            });

            //ACTION
            await forgotPasswordController(req, res);

            //ASSERT
            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({success: false, message: "Something went wrong", error});
            expect(consoleLogSpy).toHaveBeenCalledWith(error);
        });
    });


    describe('should allow password reset', () => {
        let req;


        beforeEach(() => {
            req = {
                body: {
                    email: "james@gmail.com",
                    answer: "badminton",
                    newPassword: "password",
                }
            };
        });


        it('the given email and answer exist as a pair in the database, and there is no exception', async () => {
            //ARRANGE
            userModel.findOne.mockImplementation(() => {
                return Promise.resolve({
                    _id: 1,
                    name: "James",
                    email: "james",
                    password: "james123_hashed",
                    phone: "9123 4567",
                    address: "Sentosa",
                    answer: "Badminton"
                });
            });

            //ACTION
            await forgotPasswordController(req, res);

            //ASSERT
            expect(userModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
            expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(1, { password: "Mock password" });
            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ success: true, message: "Password Reset Successfully" });
        });
    });
});
