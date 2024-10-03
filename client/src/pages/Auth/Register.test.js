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
        it('with the correct titles and a button labelled with REGISTER', () => {
            //ARRANGE

            //ACTION
            renderRegisterComponent();

            //ASSERT
            expect(screen.getByText("Mocked Register - Ecommerce App")).toBeInTheDocument();
            expect(screen.getByText("REGISTER FORM")).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'REGISTER' })).toBeInTheDocument();
        });

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


        it('where it displays an error message if register POST request did not return any value for the success attribute', async () => {
            //ARRANGE
            axios.post.mockResolvedValueOnce({
                data: { message: 'Name is required' },
            });

            //ACTION
            renderRegisterComponent();
            fillInFieldsAndRegister();

            //ASSERT
            await waitFor(() =>  {
                expect(axios.post).toHaveBeenCalledTimes(1)
                expect(axios.post).toHaveBeenCalledWith("/api/v1/auth/register", sampleInput);
                expect(toast.error).toHaveBeenCalledTimes(1);
                expect(toast.error).toHaveBeenCalledWith('Name is required');
            });
        });


        it('where it displays an error message if an exception occurs during the registration process', async () => {
            //ARRANGE
            const error = new Error('Exception during registration')
            axios.post.mockRejectedValueOnce(error);

            //ACTION
            renderRegisterComponent();
            fillInFieldsAndRegister();

            //ASSERT
            await waitFor(() =>  {
                expect(axios.post).toHaveBeenCalledTimes(1)
                expect(axios.post).toHaveBeenCalledWith("/api/v1/auth/register", sampleInput);
                expect(consoleLogSpy).toHaveBeenCalledWith(error);
                expect(toast.error).toHaveBeenCalledTimes(1);
                expect(toast.error).toHaveBeenCalledWith('Something went wrong');
            });
        });
    });
});
