import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import toast from 'react-hot-toast';
import Register from './Register';
import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { spawn } from 'child_process';
import path from 'path';
import userModel from '../../../../models/userModel';
import '@testing-library/jest-dom/extend-expect';

/**
Register.js is a UI component that makes a POST request to /api/v1/auth/register
when the form is submitted. This route invokes the RegisterController that utilises
the userModel.

The purpose of this integration test is to assess if the front-end Register.js component
is able to connect with the backend via RegisterController and userModel.

Hence, we need to have the server running during this integration test so that the
Register.js component is able to make an API call to invoke the RegisterController. We also
need a test database for userModel, which we can create using an in-memory MongoDB server.


Remarks:
Register.js uses Layout, useNavigate() and toast. It is possible to not mock these components
and test their integration with Register.js. However, for this integration test that I am designing,
I want to focus on the integration between the front-end Register.js and the backend RegisterController
and userModel. Thus, I chose to mock Layout, useNavigate() and toast in this test.
*/


//Set up the configurations required to run the server during the test
const totalTimeBeforeTimeout = 20000;
const timeForServerToStart = 8000;
jest.setTimeout(totalTimeBeforeTimeout);
axios.defaults.baseURL = 'http://localhost:6060';
const serverPath = path.join(__dirname, '../../../../server.js');


//Mock the components that the integration test is not focusing on
const mockNavigateFunction = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigateFunction,
}));
jest.mock('react-hot-toast', () => ({
    success: jest.fn(),
    error: jest.fn(),
}));
jest.mock('./../../components/Layout', () => ({ children }) => <div><h1>Mocked Register - Ecommerce App</h1><div>{ children }</div></div>);


describe('Register Component should successfully integrate with backend', () => {
    let serverProcess;
    let mongodbServer;
    let userCollectionName = 'users';


    beforeEach(async () => {
        //Reset all mocks
        jest.clearAllMocks();
    
        //Create the in-memory MongoDB server and connect to it
        mongodbServer = await MongoMemoryServer.create();
        const mongodbUri = mongodbServer.getUri();
        process.env.MONGO_URL = mongodbUri;
        await mongoose.connect(mongodbUri);
    
        //Create a user collection to work with
        await mongoose.connection.createCollection(userCollectionName);
    
        //Start the server as a process for connecting to the API
        serverProcess = spawn('node', [serverPath], {
            stdio: 'inherit',
            env: { 
                ...process.env,
                MONGO_URL: mongodbUri //Set the mongo url process environment variable to the url of the in memory server
            }
        });
    
        //Wait for the server to start
        await new Promise(resolve => setTimeout(resolve, timeForServerToStart)); 
    });
    
 
    afterEach(async () => {
        //Reset the collection
        await mongoose.connection.dropCollection(userCollectionName);
    
        //Reset the database
        await mongoose.connection.dropDatabase();
    
        //Disconnect from the in-memory MongoDB server
        await mongoose.disconnect();
        await mongodbServer.stop();
    
        //Stop the server
        serverProcess.kill();
    });


    it('where it should be able to register a user into the database', async () => {
        const userInput = {
            name: 'james',
            email: 'james@gmail.com',
            password: 'password',
            phone: '91234567',
            address: 'Sentosa',
            DOB: '2020-05-05',
            answer: 'Badminton'
        };
        

        //Render the Register component
        render(
            <MemoryRouter initialEntries={['/register']}>
                <Routes>
                <Route path="/register" element={ <Register /> } />
                </Routes>
            </MemoryRouter>
        );

        //Simulate submitting of form to make API call to backend
        fireEvent.change(screen.getByPlaceholderText('Enter Your Name'), { target: { value: userInput.name } });
        fireEvent.change(screen.getByPlaceholderText('Enter Your Email'), { target: { value: userInput.email } });
        fireEvent.change(screen.getByPlaceholderText('Enter Your Password'), { target: { value: userInput.password } });
        fireEvent.change(screen.getByPlaceholderText('Enter Your Phone'), { target: { value: userInput.phone } });
        fireEvent.change(screen.getByPlaceholderText('Enter Your Address'), { target: { value: userInput.address } });
        fireEvent.change(screen.getByPlaceholderText('Enter Your DOB'), { target: { value: userInput.DOB } });
        fireEvent.change(screen.getByPlaceholderText('What is Your Favorite sports'), { target: { value: userInput.answer } });
        fireEvent.click(screen.getByRole('button', { name: 'REGISTER' }));


        await waitFor(async () =>  {
            //Check that the successful path is reached
            expect(toast.success).toHaveBeenCalledTimes(1);
            expect(toast.success).toHaveBeenCalledWith('Register Successfully, please login');
            expect(mockNavigateFunction).toHaveBeenCalledTimes(1);
            expect(mockNavigateFunction).toHaveBeenCalledWith('/login');

            //Check that the user is indeed created in the backend database
            const updatedUser = await userModel.findOne({ email: userInput.email });
            expect(updatedUser).not.toBeNull();
            expect(updatedUser.name).toBe(userInput.name);
            expect(updatedUser.email).toBe(userInput.email);
            expect(updatedUser.phone).toBe(userInput.phone)
            expect(updatedUser.address).toBe(userInput.address)
            expect(updatedUser.answer).toBe(userInput.answer)
        });
    });
});
