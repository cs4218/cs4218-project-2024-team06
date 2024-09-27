import JWT from 'jsonwebtoken';
import { requireSignIn, isAdmin } from './authMiddleware.js';
import userModel from "../models/userModel.js";

// Mock JWT module
jest.mock('jsonwebtoken');


jest.mock('../models/userModel.js', () => ({
    findById: jest.fn()
}));


describe('requireSignIn Middleware', () => {
    let req, res, next, consoleLogSpy;

    beforeEach(() => {
        jest.clearAllMocks();

        // Initialize variables
        req = {
            headers: { authorization: 'token' },
            user: { name: 'Invalid' }
        };
        res = {};
        next = jest.fn();
    });


    afterEach(() => {
        //Restore original functionality of console.log
        consoleLogSpy?.mockRestore();
    })


    it('should set user attribute of request and call next() once if verification is successful', async () => {
        //ARRANGE
        JWT.verify.mockImplementationOnce(() => ({ name: 'Valid' }));
        
        //ACTION
        await requireSignIn(req, res, next);

        //ASSERT
        expect(req.user).toEqual(({ name: 'Valid' }));
        expect(next).toHaveBeenCalledTimes(1);
    });


    it('should log error once if verification throws an error', async () => {
        //ARRANGE
        const error = new Error('Exception for verifying');
        JWT.verify.mockImplementationOnce(() => { throw error; });
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        
        //ACTION
        await requireSignIn(req, res, next);

        //ASSERT
        expect(req.user).toEqual(({ name: 'Invalid' }));
        expect(next).toHaveBeenCalledTimes(0);
        expect(consoleLogSpy).toHaveBeenCalledWith(error);
    });
});


describe('isAdmin Middleware', () => {
    let req, res, next, consoleLogSpy;

    beforeEach(() => {
        jest.clearAllMocks();

        //Initialize variables
        req = {
            user: { _id: '' }
        };
        res = {
            status: jest.fn().mockReturnThis(), //Need to return an object as send is called again on it
            send: jest.fn(), 
        };

        next = jest.fn();
    });


    afterEach(() => {
        //Restore original functionality of console.log
        consoleLogSpy?.mockRestore();
    })


    it('should not return any response if user is an admin', async () => {
        //ARRANGE
        userModel.findById.mockImplementation((queryInput) => {
            return { role: 1 };
        });

        //ACTION
        const result = await isAdmin(req, res, next);

        //ASSERT
        expect(next).toHaveBeenCalledTimes(1);
        expect(result).toBe(undefined);
    });


    //NEVER PASS
    it('should return unauthorised access if user is not an admin, such as if role is 0', async () => {
        //ARRANGE
        userModel.findById.mockImplementation((queryInput) => {
            return { role: 0 };
        });
       
        //ACTION
        await isAdmin(req, res, next);

        //ASSERT
        expect(next).toHaveBeenCalledTimes(0);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith(({
            success: false,
            message: 'Unauthorized Access'
        }));
    });


    //NEVER PASS
    it('should return unauthorised access if user is not an admin, such as if role is 2', async () => {
        //ARRANGE
        userModel.findById.mockImplementation((queryInput) => {
            return { role: 2 };
        });
       
        //ACTION
        await isAdmin(req, res, next);

        //ASSERT
        expect(next).toHaveBeenCalledTimes(0);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith(({
            success: false,
            message: 'Unauthorized Access'
        }));
    });


    it('should log error and return error message if there is an error in processing user status', async () => {
        //ARRANGE
        const error = new Error('Exception in finding user id');
        userModel.findById.mockImplementation((queryInput) => {
            throw error;
        });
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        //ACTION
        await isAdmin(req, res, next);
        
        //ASSERT
        expect(next).toHaveBeenCalledTimes(0);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith(({
            success: false,
            error: error,
            message: 'Error in admin middleware'
        }));
    });
});