import { useAuth, AuthProvider } from "./auth";
import axios from 'axios';
import { render } from '@testing-library/react';

//Mock dependencies that AuthContext uses
jest.mock('axios');


//Console log spy to observe child component that uses AuthContext
let consoleLogSpy;


//Test suite
describe('AuthProvider Component', () => {

    //Initialisation logic for all tests
    beforeEach(() => {
        jest.clearAllMocks();

        //Mock localStorage window object
        Object.defineProperty(window, 'localStorage', {
            value: {
                setItem: jest.fn(),
                getItem: jest.fn(),
                removeItem: jest.fn(),
            },
            writable: true,
        });

        //Reset headers
        axios.defaults.headers.common = {};

        //Reinitialise console log spy
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });


    //Reset logic for all tests
    afterEach(() => {
        //Reset the getItem() method in localStorage mock after every test
        localStorage.getItem.mockReset();

        //Restore original functionality of console.log
        consoleLogSpy.mockRestore();
    });


    //Non-default value for auth state
    describe("should have non default value for its auth state", () => {
        
        it('if auth information in localStorage is a valid user object', () => {
            //ARRANGE
            localStorage.getItem.mockImplementation(() =>
                '{"user": {"_id": 1, "name": "James", "email": "james@gmail.com", "phone": "91234567", "address": "Singapore", "role": 0}, "token": "12345678"}');
       
            //ACTION
            render(
                <AuthProvider>
                    <AuthContextChild />
                </AuthProvider>
            );

            //ASSERT
            expect(axios.defaults.headers.common['Authorization']).toBe("12345678"); //Component gets refreshed
            expect(localStorage.getItem).toHaveBeenCalledWith("auth");
            expect(consoleLogSpy).toHaveBeenCalledWith({
                user: {
                    _id: 1,
                    name: "James",
                    email: "james@gmail.com",
                    phone: "91234567",
                    address: "Singapore",
                    role: 0
                },
                token: "12345678"
            });
        });
    });
});


//Mock component, with minimal logic, that uses AuthContext
const AuthContextChild = () => {
    const [auth, setAuth] = useAuth();
    
    console.log(auth);

    return null;
}
