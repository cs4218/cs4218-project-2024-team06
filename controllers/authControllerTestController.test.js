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


    it('should return protected routes if there is no error', () => {
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
});
