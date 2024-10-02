import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import toast from 'react-hot-toast';
import Login from './Login';
import { useAuth } from "../../context/auth";
import { useLocation, useNavigate } from 'react-router-dom';

//CONSTANTS AND HELPER FUNCTIONS
const sampleInput = {
    email: 'james@gmail.com',
    password: 'password',
};


//MOCK MODULES
jest.mock('axios');
jest.mock('react-hot-toast', () => ({
    success: jest.fn(),
    error: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
    useLocation: jest.fn(),
}));
jest.mock('./../../components/Layout', () => ({ children }) => <div><h1>Mocked Login - Ecommerce App</h1><div>{ children }</div></div>);
jest.mock("../../context/auth");


//MOCK localStorage WINDOW OBJECT
Object.defineProperty(window, 'localStorage', {
    value: {
        setItem: jest.fn(),
    },
    writable: true,
});
  

//Test suite for the basic workings of the login component
describe('Login Component should minimally work where it', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        const mockSetAuth = jest.fn();
        const mockAuth = { user: null, token: "" };
        useAuth.mockReturnValue([mockAuth, mockSetAuth]);
    });

    describe('should be correctly rendered', () => {
        it('with the correct titles and two buttons, LOGIN and Forgot Password', () => {
            //ARRANGE

            //ACTION
            render(
                <MemoryRouter initialEntries={['/login']}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                    </Routes>
                </MemoryRouter>
            );

            //ASSERT
            expect(screen.getByText("Mocked Login - Ecommerce App")).toBeInTheDocument();
            expect(screen.getByText("LOGIN FORM")).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'LOGIN' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Forgot Password' })).toBeInTheDocument();
        });


        describe('with the input fields', () => {
            it('where the placeholders of input fields should be correct', () => {
                //ARRANGE

                //ACTION
                render(
                    <MemoryRouter initialEntries={['/login']}>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                        </Routes>
                    </MemoryRouter>
                );

                //ASSERT
                expect(screen.getByPlaceholderText('Enter Your Email')).toBeInTheDocument();
                expect(screen.getByPlaceholderText('Enter Your Password')).toBeInTheDocument();
            });


            it('where the type of input fields should be correct', () => {
                //ARRANGE

                //ACTION
                render(
                    <MemoryRouter initialEntries={['/login']}>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                        </Routes>
                    </MemoryRouter>
                );

                //ASSERT
                expect(screen.getByPlaceholderText('Enter Your Email')).toHaveAttribute('type', 'email');
                expect(screen.getByPlaceholderText('Enter Your Password')).toHaveAttribute('type', 'password');
            });


            it('where the input fields should all initially be empty', () => {
                //ARRANGE

                //ACTION
                render(
                    <MemoryRouter initialEntries={['/login']}>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                        </Routes>
                    </MemoryRouter>
                );

                //ASSERT
                expect(screen.getByPlaceholderText('Enter Your Email').value).toBe('');
                expect(screen.getByPlaceholderText('Enter Your Password').value).toBe('');
            });


            //REMOVED AS LOGIC WILL BE REPEATED WHEN TESTING FOR FUNCTIONALITY
            // it('where the input fields should allow typing', () => {
            //     //ARRANGE

            //     //ACTION
            //     render(
            //         <MemoryRouter initialEntries={['/login']}>
            //             <Routes>
            //                 <Route path="/login" element={<Login />} />
            //             </Routes>
            //         </MemoryRouter>
            //     );
            //     fireEvent.change(screen.getByPlaceholderText('Enter Your Email'), { target: { value: sampleInput.email } });
            //     fireEvent.change(screen.getByPlaceholderText('Enter Your Password'), { target: { value: sampleInput.password } });
                

            //     //ASSERT
            //     expect(screen.getByPlaceholderText('Enter Your Email').value).toBe(sampleInput.email);
            //     expect(screen.getByPlaceholderText('Enter Your Password').value).toBe(sampleInput.password);
            // });


            it('where the input fields are all required', () => {
                //ARRANGE

                //ACTION
                render(
                    <MemoryRouter initialEntries={['/login']}>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                        </Routes>
                    </MemoryRouter>
                );

                //ASSERT
                expect(screen.getByPlaceholderText('Enter Your Email')).toHaveAttribute('required');
                expect(screen.getByPlaceholderText('Enter Your Password')).toHaveAttribute('required');

            });
        });


    });

    it('should correctly navigate to the forgot password page when clicking on the forgot password button', () => {  
        //ARRANGE
        const mockNavigateFunction = jest.fn();
        useNavigate.mockReturnValue(mockNavigateFunction);

        //ACTION
        render(
            <MemoryRouter initialEntries={['/login']}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                </Routes>
            </MemoryRouter>
        );
        fireEvent.click(screen.getByRole('button', { name: 'Forgot Password' }));

        //ASSERT
        expect(mockNavigateFunction).toHaveBeenCalledTimes(1);
        expect(mockNavigateFunction).toHaveBeenCalledWith('/forgot-password');
    });
});


//Test suite for successfully logging in
describe('Login Component should allow user to log in', () => {
    const sampleToastOptions =  {
        duration: 5000,
        icon: "🙏",
        style: {
          background: "green",
          color: "white",
        }
    }
    const mockNavigateFunction = jest.fn();
    const userData = { _id: 1, name: 'James', email: 'james@gmail.com', phone: "91234567", address: "Sentosa", role: 1 };
    const data = {
        success: true,
        message: "Login successfully",
        user: userData,
        token: 'mockToken'
    };
    const mockSetAuth = jest.fn();
    const mockAuth = {
        user: userData,
        token: ""
    };


    beforeEach(() => {
        jest.clearAllMocks();

        //Mock authentication
        useAuth.mockReturnValue([mockAuth, mockSetAuth]);

        //Mock navigate
        useNavigate.mockReturnValue(mockNavigateFunction);
        useNavigate.mockReturnValue(mockNavigateFunction);

        //Mock axios
        axios.post.mockResolvedValueOnce({ data: data });
    });


    it('and navigate to location state if present', async () => {
        //ARRANGE
        const mockLocationValue = { state: '/categories' };
        useLocation.mockReturnValue(mockLocationValue);

        //ACTION
        const { getByPlaceholderText, getByText } = render(
            <MemoryRouter initialEntries={['/login']}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                </Routes>
            </MemoryRouter>
        );

        fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: sampleInput.email } });
        fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: sampleInput.password } });
        fireEvent.click(getByText('LOGIN'));


        //ASSERT
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledTimes(1);
            expect(axios.post).toHaveBeenCalledWith("/api/v1/auth/login", sampleInput);
            expect(toast.success).toHaveBeenCalledTimes(1);
            expect(toast.success).toHaveBeenCalledWith('Login successfully', sampleToastOptions);
            expect(mockSetAuth).toHaveBeenCalledTimes(1);
            expect(mockSetAuth).toHaveBeenCalledWith({user: userData, token: "mockToken" });
            expect(localStorage.setItem).toHaveBeenCalledWith('auth', JSON.stringify(data));
            expect(mockNavigateFunction).toHaveBeenCalledTimes(1);
            expect(mockNavigateFunction).toHaveBeenCalledWith('/categories');
        });
    });

    it('and navigate to root if location state is absent', async () => {
        //ARRANGE
        const mockLocationValue = {};
        useLocation.mockReturnValue(mockLocationValue);

        //ACTION
        const { getByPlaceholderText, getByText } = render(
            <MemoryRouter initialEntries={['/login']}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                </Routes>
            </MemoryRouter>
        );

        fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: sampleInput.email } });
        fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: sampleInput.password } });
        fireEvent.click(getByText('LOGIN'));


        //ASSERT
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledTimes(1);
            expect(axios.post).toHaveBeenCalledWith("/api/v1/auth/login", sampleInput);
            expect(toast.success).toHaveBeenCalledTimes(1);
            expect(toast.success).toHaveBeenCalledWith('Login successfully', sampleToastOptions);
            expect(mockSetAuth).toHaveBeenCalledTimes(1);
            expect(mockSetAuth).toHaveBeenCalledWith({user: userData, token: "mockToken" });
            expect(localStorage.setItem).toHaveBeenCalledWith('auth', JSON.stringify(data));
            expect(mockNavigateFunction).toHaveBeenCalledTimes(1);
            expect(mockNavigateFunction).toHaveBeenCalledWith('/');
        });
    });
});


//Test suite for unsuccessful login
describe('Login Component should not allow user to log in', () => {
    let consoleLogSpy;
    const mockSetAuth = jest.fn();
    const mockAuth = {
        user: null,
        token: ""
    };


    beforeEach(() => {
        jest.clearAllMocks();

        //Mock authentication
        useAuth.mockReturnValue([mockAuth, mockSetAuth]);

        //Reinitialise console log spy
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });


    afterEach(() => {
        //Restore original functionality of console.log
        consoleLogSpy?.mockRestore();
    });


    it('if POST request did not return a success response', async () => {
        //ARRANGE
        //Mock axios
        const data = {
            success: false,
            message: "Cannot login",
        };
        axios.post.mockResolvedValueOnce({ data: data });


        //ACTION
        const { getByPlaceholderText, getByText } = render(
            <MemoryRouter initialEntries={['/login']}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                </Routes>
            </MemoryRouter>
        );
        fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: sampleInput.email } });
        fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: sampleInput.password } });
        fireEvent.click(getByText('LOGIN'));

        //ASSERT
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledTimes(1);
            expect(axios.post).toHaveBeenCalledWith("/api/v1/auth/login", sampleInput);
            expect(toast.error).toHaveBeenCalledTimes(1);
            expect(toast.error).toHaveBeenCalledWith('Cannot login');
        });
    });


    it('if an exception occurs during logging in', async () => {
        //ARRANGE
        const error = new Error('Exception during login')
        axios.post.mockRejectedValueOnce(error);

        //ACTION
        const { getByPlaceholderText, getByText } = render(
            <MemoryRouter initialEntries={['/login']}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                </Routes>
            </MemoryRouter>
        );
        fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: sampleInput.email } });
        fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: sampleInput.password } });
        fireEvent.click(getByText('LOGIN'));

        //ASSERT
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledTimes(1);
            expect(axios.post).toHaveBeenCalledWith("/api/v1/auth/login", sampleInput);
            expect(toast.error).toHaveBeenCalledTimes(1);
            expect(toast.error).toHaveBeenCalledWith('Something went wrong');
            expect(consoleLogSpy).toHaveBeenCalledWith(error);
        });
    });
});