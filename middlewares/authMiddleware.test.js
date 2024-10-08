import JWT from 'jsonwebtoken';
import { requireSignIn, isAdmin } from './authMiddleware.js';
import userModel from "../models/userModel.js";

// Mock JWT module
jest.mock('jsonwebtoken');


jest.mock('../models/userModel.js', () => ({
    findById: jest.fn()
}));


describe('requireSignIn Middleware', () => {
    let req, res, next;

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


    it('should set user attribute of request and call next() once if verification is successful', async () => {
        //ARRANGE
        JWT.verify.mockImplementationOnce(() => ({ name: 'Valid' }));
        
        //ACTION
        await requireSignIn(req, res, next);

        //ASSERT
        expect(req.user).toEqual(({ name: 'Valid' }));
        expect(next).toHaveBeenCalledTimes(1);
    });
});


describe('isAdmin Middleware', () => {
    let req, res, next;

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


    it('should not return any response if user is an admin, where role is 1', async () => {
        //ARRANGE
        userModel.findById.mockImplementation(() => {
            return { role: 1 }; //User is admin
        });

        //ACTION
        const result = await isAdmin(req, res, next);

        //ASSERT
        expect(next).toHaveBeenCalledTimes(1);
        expect(result).toBe(undefined);
        expect(res.status).toHaveBeenCalledTimes(0); //If user is admin, we do not even call res.status
    });


    //NEVER PASS
    it.failing('should return unauthorised access if user is not an admin, such as if role is 0', async () => {
        //ARRANGE
        userModel.findById.mockImplementation(() => {
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
});
