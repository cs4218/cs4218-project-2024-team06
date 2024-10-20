/**
 * Orders.js uses useAuth(), axios.get(), the Layout.js and UserMenu.js. The objective of this 
 * integration test is to test if Orders.js is able to work with these 4 things.
 * 
 * However, the Layout component calls on 2 children components Header.js and Footer.js, of which 
 * the former calls uses useCart(), useCategory() and SearchInput.js. SearchInput.js in turn uses 
 * useSearch and useNavigate. Since the integration test is only concerned with the integration 
 * between Orders.js, useAuth(), axios.get(), Layout.js and UserMenu.js, the integration test 
 * should not be concerned with the functionality of these other components.
 */

import '@testing-library/jest-dom';
import axios from "axios";
import { AuthProvider } from '../../context/auth';
import { CartProvider } from '../../context/cart';
import { MemoryRouter } from 'react-router-dom';
import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';
import orderModel from "../../../../models/orderModel";
import Orders from './Orders';
import path from 'path';
import productModel from "../../../../models/productModel";
import { render, screen } from '@testing-library/react';
import { SearchProvider } from '../../context/search';
import { spawn } from 'child_process';
import userModel from "../../../../models/userModel";

const user1 = new userModel({
    name: "Halimah Yacob", 
    email: "yacob@gov.sg", 
    password: "safePassword", 
    phone: "88888888", 
    address: "Not Istana", 
    answer: "safeAnswer", 
    role: 0
});

const user2 = new userModel({
    name: "Tharman Shanmugaratnam", 
    email: "tharman@gov.sg", 
    password: "saferPassword", 
    phone: "999", 
    address: "Istana", 
    answer: "saferAnswer", 
    role: 1
});

const product1 = new productModel({
    name: "Keychron Q2", 
    slug: "Keychron Q2", 
    description: "Amazing keyboard to empty your wallet",  
    price: 250, 
    category: new mongoose.Types.ObjectId(), 
    quantity: 10, 
    shipping: false
});

const product2 = new productModel({
    name: "Keychron K6", 
    slug: "Keychron K6", 
    description: "Amazing keyboard while not emptying your wallet",  
    price: 100, 
    category: new mongoose.Types.ObjectId(), 
    quantity: 5, 
    shipping: false
});

const product3 = new productModel({
    name: "Logitech Mouse", 
    slug: "Logitech Mouse", 
    description: "Not the animal, but the computer accessory",  
    price: 50, 
    category: new mongoose.Types.ObjectId(),  
    quantity: 20, 
    shipping: true
});

const product4 = new productModel({
    name: "Shirt", 
    slug: "Shirt", 
    description: "To be worn on the upper body",  
    price: 30, 
    category: new mongoose.Types.ObjectId(), 
    quantity: 15, 
    shipping: true
});

const orderStatusEnum = ["Not Process", "Processing", "Shipped", "deliverd", "cancel"];

const order1 = new orderModel({
    products: [product1._id, product2._id], 
    payment: { success: true }, 
    buyer: user1._id, 
    status: orderStatusEnum[1]
});

const order2 = new orderModel({
    products: [product3._id], 
    payment: { success: false }, 
    buyer: user1._id, 
    status: orderStatusEnum[4]
});

const otherOrder = new orderModel({
    products: [product4._id], 
    payment: { success: true }, 
    buyer: user2._id, 
    status: orderStatusEnum[3]
})

const mockAuthData = JSON.stringify({
    user: user1, 
    token: 'fakeToken',
});

const totalTimeBeforeTimeout = 20000;
jest.setTimeout(totalTimeBeforeTimeout);
axios.defaults.baseURL = 'http://localhost:6060';

describe("Orders.js integration test", () => {
    let mongoServer, serverProcess;
    const timeForServerToStart = 8000;

    /**
     * Note that the naming convention here is not standardised and extremely confusing. However, 
     * we will keep what is used in the schemas as this falls outside the scope of this integration 
     * test.
     */
    const usersCollection = "users";
    const productsCollection = "Products";
    const ordersCollection = "Order";

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
        const serverPath = path.join(__dirname, '../../../../server.js');
        serverProcess = spawn('node', [serverPath], {
            env: { ...process.env, MONGO_URL: uri }
        });

        serverProcess.stdout.on('data', (data) => {
            console.log(`Server stdout: ${data}`);
        });

        serverProcess.stderr.on('data', (data) => {
            console.error(`Server stderr: ${data}`);
        });

        localStorage.setItem('auth', mockAuthData);
        await new Promise((resolve) => setTimeout(resolve, timeForServerToStart));
    });

    beforeEach(async () => {
        await mongoose.connection.createCollection(usersCollection);
        await mongoose.connection.createCollection(productsCollection);
        await mongoose.connection.createCollection(ordersCollection);
        await user1.save();
        await user2.save();
        await product1.save();
        await product2.save();
        await product3.save();
        await product4.save();
        await order1.save();
        await order2.save();
        await otherOrder.save();
    });

    afterEach(async () => {
        await mongoose.connection.dropCollection(usersCollection);
        await mongoose.connection.dropCollection(productsCollection);
        await mongoose.connection.dropCollection(ordersCollection);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
        await mongoServer.stop();
        serverProcess.kill();
        localStorage.removeItem('auth');
    });

    it("should fetch orders from the server and display them", async () => {
        render(
            <AuthProvider>
                <CartProvider>
                    <SearchProvider>
                        <MemoryRouter>
                            <Orders />
                        </MemoryRouter>
                    </SearchProvider>
                </CartProvider>
            </AuthProvider>
        );
    });
});