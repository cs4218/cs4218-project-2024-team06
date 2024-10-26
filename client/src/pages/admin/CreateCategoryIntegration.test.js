import React from "react";
import axios from "axios";
import CreateCategory from "./CreateCategory";
import { render, screen, waitFor} from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import '@testing-library/jest-dom/extend-expect';
import { AuthProvider } from "../../context/auth";
import { CartProvider } from "../../context/cart";
import { SearchProvider } from "../../context/search";
import { spawn } from "child_process";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import categoryModel from "../../../../models/categoryModel";
import { Toaster } from "react-hot-toast";
import path from "path";

axios.defaults.baseURL = 'http://localhost:6060';
const serverPath = path.join(__dirname, '../../../../server.js');
const timeForServerToStart = 8000;
const totalTimeBeforeTimeout = 20000;
jest.setTimeout(totalTimeBeforeTimeout);

describe('Integration of create category page and subcomponents', () => {
    let serverProcess;
    let mongodbServer;

    beforeEach(async () => {
        jest.clearAllMocks();

        mongodbServer = await MongoMemoryServer.create();
        const mongodbUri = mongodbServer.getUri();
        process.env.MONGO_URL = mongodbUri;
        await mongoose.connect(mongodbUri);

        serverProcess = spawn('node', [serverPath], {
            stdio: 'inherit',
            env: { 
                ...process.env,
                MONGO_URL: mongodbUri
            }
        });

        await new Promise(resolve => setTimeout(resolve, timeForServerToStart)); 
    });

    afterEach(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
        await mongodbServer.stop();
        serverProcess.kill();
    });

    describe("When the parent component is rendered", () => {
        test('The subcomponents are successfully rendered', async () => {
            
            //ARRANGE 

            //categories already existing
            await new categoryModel({ name: 'dresses', slug: 'dresses' }).save();
            await new categoryModel({ name: 'toys', slug: 'toys' }).save();
            await new categoryModel({ name: 'books', slug: 'books' }).save();
            await new categoryModel({ name: 'pens', slug: 'pens' }).save();
            await new categoryModel({ name: 'phones', slug: 'phones' }).save();
            await new categoryModel({ name: 'pants', slug: 'pants' }).save();

            //ACT
            render(
                <AuthProvider>
                <CartProvider>
                    <SearchProvider>
                        <Router>
                            <Toaster />
                            <CreateCategory />
                        </Router>
                    </SearchProvider>
                </CartProvider>
            </AuthProvider>
            );

            //ASSERT

            //Admin Panel: mock replaced with actual component
            await waitFor(() => {
                expect(screen.getByText(/Admin Panel/)).toBeInTheDocument(); 
            })
            await waitFor(() => {
                expect(screen.getByRole('link', { name: 'Create Category' })).toBeInTheDocument(); //link 1
            })
            await waitFor(() => {
                expect(screen.getByRole('link', { name: 'Create Product' })).toBeInTheDocument(); //link 2
            })   
            await waitFor(() => {    
                expect(screen.getByRole('link', { name: 'Products' })).toBeInTheDocument();
            })
            await waitFor(() => {    
                expect(screen.getByRole('link', { name: 'Orders' })).toBeInTheDocument();
            })

            //Category Form: mock replaced with actual component

            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument();
            })
            
            await waitFor(() => {
                expect(screen.getByRole('textbox')).toHaveProperty('placeholder', "Enter new category");
            })
            await waitFor(() => {    
                expect(screen.getByText('Submit')).toBeInTheDocument();
            })

            //Correctly displays fetched categories (existing)
            await waitFor(() => {
                expect(screen.getAllByText('dresses').length).toBeGreaterThan(0);
            })
            
            await waitFor(() => {
                expect(screen.getAllByText('books').length).toBeGreaterThan(0);
            })
            await waitFor(() => {    
                expect(screen.getAllByText('toys').length).toBeGreaterThan(0);
            })   
            await waitFor(() => {
                expect(screen.getAllByText('pens').length).toBeGreaterThan(0);
            })
            await waitFor(() => {    
                expect(screen.getAllByText('pants').length).toBeGreaterThan(0);
            })
            await waitFor(() => {    
                expect(screen.getAllByText('phones').length).toBeGreaterThan(0);
            })

        });
    });

});