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
const sampleToastOptions =  {
    duration: 5000,
    icon: "🙏",
    style: {
      background: "green",
      color: "white",
    }
}


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
  


describe('Login Component should correctly offer the Login functionality', () => {
    const mockNavigateFunction = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();

        //Mock authentication
        const mockSetAuth = jest.fn();
        const mockAuth = { user: null, token: "" };
        useAuth.mockReturnValue([mockAuth, mockSetAuth]);

        const mockLocationValue = { state: '/categories' };
      
        useLocation.mockReturnValue(mockLocationValue);
        useNavigate.mockReturnValue(mockNavigateFunction);
    });


    it('should login the user successfully if user entered valid user details', async () => {
        //ARRANGE
        const data = {
            success: true,
            message: "Login successfully",
            user: { id: 1, name: 'James', email: 'james@gmail.com' },
            token: 'mockToken'
        };
        axios.post.mockResolvedValueOnce({ data: data});



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
            expect(localStorage.setItem).toHaveBeenCalledWith('auth', JSON.stringify(data));
            expect(mockNavigateFunction).toHaveBeenCalledTimes(1);
            expect(mockNavigateFunction).toHaveBeenCalledWith('/categories');
        });
    });





});
