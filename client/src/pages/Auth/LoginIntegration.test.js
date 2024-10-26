import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import toast from 'react-hot-toast';
import Login from './Login';
import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { spawn } from 'child_process';
import path from 'path';
import userModel from '../../../../models/userModel';
import '@testing-library/jest-dom/extend-expect';
import { AuthProvider } from "../../context/auth";

/**
Login.js is a UI component that makes a POST request to /api/v1/auth/login when the
form is submitted. This route invokes the LoginController that utilises
the userModel.

The purpose of this integration test is to assess if the front-end Login.js component
is able to connect with the backend via LoginController and userModel. Also, I want
to test if Login.js is able integrate with useAuth() and localStorage to assess if user
information can be populated into the auth context.

Hence, we need to have the server running during this integration test so that the
Login.js component is able to make an API call to invoke the LoginController. We also
need a test database for userModel, which we can create using an in-memory MongoDB server.
Lastly, we also unmock useAuth() and localStorage.

Remarks:
Login.js uses Layout, useNavigate(), useLocation() and toast. However, as mentioned above,
the purpose of this integration test is to test the integration between front and back end,
as well as populating information into the authState. Thus, I decided to mock these 4 components,
although in another higher-level integration test, they could be unmocked.
*/


//Set up the configurations required to run the server during the test
const totalTimeBeforeTimeout = 20000;
const timeForServerToStart = 8000;
jest.setTimeout(totalTimeBeforeTimeout);
axios.defaults.baseURL = 'http://localhost:6060';
const serverPath = path.join(__dirname, '../../../../server.js');


//Mock the components that the integration test is not focusing on
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


describe('Login Component should successfully integrate with backend', () => {
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

        //Reset the local storage
        localStorage.removeItem("auth");
    });


    it('where it should be able to login a user', async () => {
        const unhashedPassword = 'password';
        const hashedPassword = '$2b$10$WAPTi0bcYFfJkncMUjER5eS8.xo3WNYHaorAx9LPXvbsmmBH3x6tS';
        const userInformation = {
            name: 'James',
            email: 'james@gmail.com',
            password: hashedPassword,
            phone: '91234567',
            address: 'Sentosa',
            answer: 'Badminton',
            role: 0,
        };
     
        //Add a user into the in-memory MongoDB database so the user can be retrieved during login
        const newUser = new userModel(userInformation);
        await newUser.save();

        //Render the Login component
        const { getByPlaceholderText, getByText } = render(
            <AuthProvider>
                <MemoryRouter initialEntries={['/login']}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        );

        //Simulate submitting of form to make API call to backend
        fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: userInformation.email } });
        fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: unhashedPassword } });
        fireEvent.click(getByText('LOGIN'));

        await waitFor(async () =>  {
            //Check that the successful path is reached
            expect(toast.success).toHaveBeenCalledTimes(1);
            expect(toast.success).toHaveBeenCalledWith('login successfully', {
                "duration": 5000, "icon": "🙏", "style": {"background": "green", "color": "white"}
            });

            //Check if local storage is successfully set with data of user who is logged in
            const userDataInLocalStorage = JSON.parse(localStorage.getItem("auth"));
            expect(userDataInLocalStorage.success).toBe(true);
            expect(userDataInLocalStorage.user.name).toBe(userInformation.name);
            expect(userDataInLocalStorage.user.email).toBe(userInformation.email);
        });
    });
});
