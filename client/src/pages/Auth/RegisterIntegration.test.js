import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import toast from 'react-hot-toast';
import Register from './Register';
import { spawn } from 'child_process';
import path from 'path';



jest.setTimeout(20000);
axios.defaults.baseURL = 'http://localhost:6060';


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
            <Route path="/register" element={ <Register /> } />
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



    const serverPath = path.join(__dirname, '../../../../server.js');

    let serverProcess;


    beforeAll((done) => {
        // Start the server as a separate process
        serverProcess = spawn('node', [serverPath], { stdio: 'inherit' });
      
        // Wait for the server to start
        setTimeout(done, 10000); // Adjust timeout based on how long your server takes to start
      });
      
    afterAll((done) => {
        // Kill the server process after tests
        serverProcess.kill();
        done();
    });



  

    describe ('should correctly offer the register functionality', () => {
        it('where it provides a success message and navigates to /login upon successful registration', async () => {
            //ARRANGE

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
        }, 20000000);
    });
});
