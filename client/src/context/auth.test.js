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


    describe('should have default value for its auth state', () => {
        beforeEach(() => {
            consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        });


        //Test case 1
        it('if auth information in localStorage is null', () => {
            //ARRANGE
            localStorage.getItem.mockImplementation(() => null);
       
            //ACTION
            render(
                <AuthProvider>
                    <AuthContextChild />
                </AuthProvider>
            );

            //ASSERT
            expect(axios.defaults.headers.common['Authorization']).toBe("");
            expect(localStorage.getItem).toHaveBeenCalledWith("auth");
            expect(consoleLogSpy).toHaveBeenCalledWith({
                user: null,
                token: ""
            });
        });


        //Test case 2
        it('if auth information in localStorage is an empty string', () => {
            //ARRANGE
            localStorage.getItem.mockImplementation(() => "");
            
            //ACTION
            render(
                <AuthProvider>
                    <AuthContextChild />
                </AuthProvider>
            );

            //ASSERT
            expect(axios.defaults.headers.common['Authorization']).toBe("");
            expect(localStorage.getItem).toHaveBeenCalledWith("auth");
            expect(consoleLogSpy).toHaveBeenCalledWith({
                user: null,
                token: ""
            });
        });
    });
});


//Stub component, with minimal logic, that uses AuthContext
const AuthContextChild = () => {
    const [auth, setAuth] = useAuth();
    
    console.log(auth);

    return null;
}