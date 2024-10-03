import bcrypt from 'bcrypt';
import { hashPassword, comparePassword } from './authHelper';

// Mock bcrypt module
jest.mock('bcrypt');

// Test suite for hashPassword method
describe('Hash Password Method', () => {
    const numberOfSaltRounds = 10;
    let consoleLogSpy;


    beforeEach(() => {
        jest.clearAllMocks();
    });

    //Reset logic for all tests
    afterEach(() => {
        //Restore original functionality of console.log
        consoleLogSpy?.mockRestore();
    });

    it('should return hashed password if bcrypt hash does not throw an error', async () => {
        //ARRANGE
        const password = 'password';
        const hashedPassword = 'p1s2w3r4';
        // Mock bcrypt.hash to return the hashed password
        bcrypt.hash.mockResolvedValueOnce(hashedPassword);

        //ACTION
        const result = await hashPassword(password, numberOfSaltRounds);

        //ASSERT
        expect(result).toBe(hashedPassword);
    });
});


// Test suite for comparePassword method
describe('Compare Password Method', () => {
    const password = "password";
    const hashedPassword = 'p1s2w3r4';
    // const incorrectHashedPassword = 'p1';

    beforeEach(() => {
        jest.clearAllMocks();
    });


    it('should return true if the unhashed version of hashed password is password', async () => {
        //ARRANGE
        bcrypt.compare.mockResolvedValueOnce(true);

        //ACTION
        const result = await comparePassword(password, hashedPassword);

        //ASSERT
        expect(result).toBe(true);
    });
});
