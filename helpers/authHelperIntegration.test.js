import { comparePassword } from './authHelper'

/**
Objective: Test whether compare password can integrate with third-party bcrypt library
*/
describe('Compare Password Method', () => {

    it('should return true if hashed password is hashed version of password', async () => {
        
        const password = 'password';
        const hashedPassword = '$2b$10$WAPTi0bcYFfJkncMUjER5eS8.xo3WNYHaorAx9LPXvbsmmBH3x6tS';

        
        const result = await comparePassword(password, hashedPassword);

        //ASSERT
        expect(result).toBe(true);
    });
});
