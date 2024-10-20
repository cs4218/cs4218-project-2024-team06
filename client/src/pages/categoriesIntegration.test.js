import React from "react";
import axios from "axios";
import Categories from "../pages/Categories";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import '@testing-library/jest-dom/extend-expect';
import { AuthProvider } from "../context/auth";
import { CartProvider } from "../context/cart";
import { SearchProvider } from "../context/search";
import { spawn } from "child_process";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import categoryModel from "../../../models/categoryModel";
import path from "path";

axios.defaults.baseURL = 'http://localhost:6060';
const serverPath = path.join(__dirname, '../../../server.js');
const timeForServerToStart = 8000;
const totalTimeBeforeTimeout = 20000;
jest.setTimeout(totalTimeBeforeTimeout);

describe('integration of categories with layout and useCategory', () => {
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


    test('should call useCategory to fetch categories and display', async () => {
        await new categoryModel({ name: 'Category 1', slug: 'category-1' }).save();
        await new categoryModel({ name: 'Category 2', slug: 'category-2' }).save();

        render(
            <AuthProvider>
                <CartProvider>
                    <SearchProvider>
                        <Router>
                            <Categories />
                        </Router>
                    </SearchProvider>
                </CartProvider>
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getAllByText('Category 1').length).toBeGreaterThan(0);
            expect(screen.getAllByText('Category 2').length).toBeGreaterThan(0);
        });
    });
});
