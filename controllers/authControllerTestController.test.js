import { testController } from './authController.js';


// Test suite for testController
describe('testController', () => {
    let req;
    let consoleLogSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {};

        //Reinitialise console log spy
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        //Restore original functionality of console.log
        consoleLogSpy.mockRestore();
    });


    it('should return protected routes if there is no error', async () => {
        //ARRANGE
        const res = {
            send: jest.fn(),
        };
    
        //ACTION
        testController(req, res);

        //ASSERT
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith("Protected Routes");
    });


    it('should return error if there is an error', async () => {
        //ARRANGE
        const error = new Error('Exception during login');
        const res = {
            send: jest.fn(() => { throw error; }), //Mock error being thrown
        };
    
        //ACTION
        try {
            testController(req, res);
        } catch (error) {
            //ASSERT
            expect(res.send).toHaveBeenCalledTimes(2);
            expect(res.send).toHaveBeenNthCalledWith(1, "Protected Routes");
            expect(res.send).toHaveBeenNthCalledWith(2, { error });
            expect(consoleLogSpy).toHaveBeenCalledWith(error);
        }
    });
});
