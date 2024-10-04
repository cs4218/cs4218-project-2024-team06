import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import toast from 'react-hot-toast';
import Register from './Register';

//CONSTANTS AND HELPER FUNCTIONS
const sampleInput = {
    name: 'james',
    email: 'james@gmail.com',
    password: 'password',
    phone: '91234567',
    address: 'Sentosa',
    DOB: '2020-05-05',
    answer: 'Badminton'
};
const mockNavigateFunction = jest.fn();

//Helper function to render Register component
const renderRegisterComponent = () => {
    render(
        <MemoryRouter initialEntries={['/register']}>
            <Routes>
            <Route path="/register" element={<Register />} />
            </Routes>
        </MemoryRouter>
  );
}

//Helper function to fill in fields and press REGISTER button
const fillInFieldsAndRegister = () => {
    fireEvent.change(screen.getByPlaceholderText('Enter Your Name'), { target: { value: sampleInput.name } });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Email'), { target: { value: sampleInput.email } });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Password'), { target: { value: sampleInput.password } });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Phone'), { target: { value: sampleInput.phone } });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Address'), { target: { value: sampleInput.address } });
    fireEvent.change(screen.getByPlaceholderText('Enter Your DOB'), { target: { value: sampleInput.DOB } });
    fireEvent.change(screen.getByPlaceholderText('What is Your Favorite sports'), { target: { value: sampleInput.answer } });
    fireEvent.click(screen.getByRole('button', { name: 'REGISTER' }));
}


// Mock modules
jest.mock('axios');
jest.mock('react-hot-toast', () => ({
    success: jest.fn(),
    error: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigateFunction,
}));
//Mock the external components that Register component uses
jest.mock('./../../components/Layout', () => ({ children }) => <div><h1>Mocked Register - Ecommerce App</h1><div>{ children }</div></div>);



describe('Register Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('should be correctly rendered', () => {

        it('with the correct titles and with a button labelled with REGISTER', () => {
            //ARRANGE

            //ACTION
            renderRegisterComponent();

            //ASSERT
            expect(screen.getByText("Mocked Register - Ecommerce App")).toBeInTheDocument();
            expect(screen.getByText("REGISTER FORM")).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'REGISTER' })).toBeInTheDocument();
        });


        describe('with the input fields', () => {
            //NEVER PASS
            it.failing('where the placeholders of input fields should be correct', () => {
                //ARRANGE
        
                //ACTION
                renderRegisterComponent();
        
                //ASSERT
                expect(screen.getByPlaceholderText('Enter Your Name')).toBeInTheDocument();
                expect(screen.getByPlaceholderText('Enter Your Email')).toBeInTheDocument();
                expect(screen.getByPlaceholderText('Enter Your Password')).toBeInTheDocument();
                expect(screen.getByPlaceholderText('Enter Your Phone')).toBeInTheDocument();
                expect(screen.getByPlaceholderText('Enter Your Address')).toBeInTheDocument();
                expect(screen.getByPlaceholderText('Enter Your DOB')).toBeInTheDocument();
                expect(screen.getByPlaceholderText('What Is Your Favorite Sport')).toBeInTheDocument();
            });


            //NEVER PASS
            it.failing('where the type of input fields should be correct', () => {
                //ARRANGE
        
                //ACTION
                renderRegisterComponent();
        
                //ASSERT
                expect(screen.getByPlaceholderText('Enter Your Name')).toHaveAttribute('type', 'text');
                expect(screen.getByPlaceholderText('Enter Your Email')).toHaveAttribute('type', 'email');
                expect(screen.getByPlaceholderText('Enter Your Password')).toHaveAttribute('type', 'password');
                expect(screen.getByPlaceholderText('Enter Your Phone')).toHaveAttribute('type', 'text');
                expect(screen.getByPlaceholderText('Enter Your Address')).toHaveAttribute('type', 'text');
                expect(screen.getByPlaceholderText('Enter Your DOB')).toHaveAttribute('type', 'date');
                expect(screen.getByPlaceholderText('What Is Your Favorite Sport')).toHaveAttribute('type', 'text');
            });


            it('where the input fields should all initially be empty', () => {
                //ARRANGE
        
                //ACTION
                renderRegisterComponent();
        
                //ASSERT
                expect(screen.getByPlaceholderText('Enter Your Name').value).toBe('');
                expect(screen.getByPlaceholderText('Enter Your Email').value).toBe('');
                expect(screen.getByPlaceholderText('Enter Your Password').value).toBe('');
                expect(screen.getByPlaceholderText('Enter Your Phone').value).toBe('');
                expect(screen.getByPlaceholderText('Enter Your Address').value).toBe('');
                expect(screen.getByPlaceholderText('Enter Your DOB').value).toBe('');
                /* Previous test already caught error with the placeholder text for the sports field
                    Hence, I still use the wrong placeholder because intention of this test is to check initial value
                    and not label
                */
                expect(screen.getByPlaceholderText('What is Your Favorite sports').value).toBe('');
            });


            it('where the input fields should all be required', () => {
                //ARRANGE
               
                //ACTION
                renderRegisterComponent();

                //ASSERT
                expect(screen.getByPlaceholderText('Enter Your Name')).toHaveAttribute("required");
                expect(screen.getByPlaceholderText('Enter Your Email')).toHaveAttribute("required");
                expect(screen.getByPlaceholderText('Enter Your Password')).toHaveAttribute("required");
                expect(screen.getByPlaceholderText('Enter Your Phone')).toHaveAttribute("required");
                expect(screen.getByPlaceholderText('Enter Your Address')).toHaveAttribute("required");
                expect(screen.getByPlaceholderText('Enter Your DOB')).toHaveAttribute("required");
                /* Previous test already caught error with the placeholder text for the sports field
                    Hence, I still use the wrong placeholder because intention of this test is to check whether the
                    input fields allow typing and not label
                */
                expect(screen.getByPlaceholderText('What is Your Favorite sports')).toHaveAttribute("required");
                
            })
        });
    });


    describe ('should correctly offer the register functionality', () => {
        let consoleLogSpy;

        beforeEach(() => {
            //Reinitialise console log spy
            consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        });

        afterEach(() => {
            //Restore original functionality of console.log
            consoleLogSpy?.mockRestore();
        });


        it('where it provides a success message and navigates to /login upon successful registration', async () => {
            //ARRANGE
            axios.post.mockResolvedValueOnce({
                data: { success: true, message: 'Successful registration' },
            });

            //ACTION
            renderRegisterComponent();
            fillInFieldsAndRegister();

            //ASSERT
            await waitFor(() =>  {
                expect(axios.post).toHaveBeenCalledTimes(1)
                expect(axios.post).toHaveBeenCalledWith("/api/v1/auth/register", sampleInput);
                expect(toast.success).toHaveBeenCalledTimes(1);
                expect(toast.success).toHaveBeenCalledWith('Register Successfully, please login');
                expect(mockNavigateFunction).toHaveBeenCalledTimes(1);
                expect(mockNavigateFunction).toHaveBeenCalledWith('/login');
            });
        });


        it('where it displays an error message if register POST request indicates false for success attribute', async () => {
                //ARRANGE
                axios.post.mockResolvedValueOnce({
                data: { success: false, message: 'Already registered, please login' },
                });

                //ACTION
                renderRegisterComponent();
                fillInFieldsAndRegister();

                //ASSERT
                await waitFor(() =>  {
                expect(axios.post).toHaveBeenCalledTimes(1)
                expect(axios.post).toHaveBeenCalledWith("/api/v1/auth/register", sampleInput);
                expect(toast.error).toHaveBeenCalledTimes(1);
                expect(toast.error).toHaveBeenCalledWith('Already registered, please login');
                });
        });


        it('where it displays an error message if axios.post returns a null value', async () => {
            //ARRANGE
            axios.post.mockResolvedValueOnce(null);

            //ACTION
            renderRegisterComponent();
            fillInFieldsAndRegister();

            //ASSERT
            await waitFor(() =>  {
                expect(axios.post).toHaveBeenCalledTimes(1)
                expect(axios.post).toHaveBeenCalledWith("/api/v1/auth/register", sampleInput);
                expect(toast.error).toHaveBeenCalledTimes(1);
                //When res is null, trying to read res.data.message leads to an exception
                expect(toast.error).toHaveBeenCalledWith("Something went wrong");
                expect(consoleLogSpy).toHaveBeenCalledWith(new Error("Cannot read properties of null (reading 'data')"));
            });
        });
    });
});
