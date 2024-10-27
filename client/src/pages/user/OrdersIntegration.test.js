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
import { waitFor } from '@testing-library/react';
import categoryModel from '../../../../models/categoryModel';
import { CartProvider } from '../../context/cart';
import dotenv from 'dotenv';
import JWT from "jsonwebtoken";
import { MemoryRouter } from 'react-router-dom';
import moment from 'moment';
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

dotenv.config();

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

const category1 = new categoryModel({
    name: "Technology", 
    slug: "technology"
});

const category2 = new categoryModel({
    name: "Fashion", 
    slug: "fashion"
});

const product1 = new productModel({
    name: "Keychron Q2", 
    slug: "keychron_q2", 
    description: "Amazing keyboard to empty your wallet",  
    price: 250, 
    category: category1._id,  
    quantity: 10, 
    shipping: false
});

const product2 = new productModel({
    name: "Keychron K6", 
    slug: "keychron_k6", 
    description: "Amazing keyboard while not emptying your wallet",  
    price: 100, 
    category: category1._id,  
    quantity: 5, 
    shipping: false
});

const product3 = new productModel({
    name: "Logitech Mouse", 
    slug: "logitech_mouse", 
    description: "Not the animal, but the computer accessory",  
    price: 50, 
    category: category1._id,   
    quantity: 20, 
    shipping: true
});

const product4 = new productModel({
    name: "Shirt", 
    slug: "shirt", 
    description: "To be worn on the upper body",  
    price: 30, 
    category: category2._id,  
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
});

const renderProductDescription = (productDescription) => {
    return productDescription.substring(0, 30);
};

const timeBeforeTimeout = 20000;
jest.setTimeout(timeBeforeTimeout);
axios.defaults.baseURL = 'http://localhost:6060';

describe("Orders.js integration test", () => {
    let mongoServer
    let serverProcess;
    const timeForServerToStart = 8000;

    /**
     * Note that the naming convention here is not standardised and extremely confusing. However, 
     * we will keep what is used in the schemas as this falls outside the scope of this integration 
     * test.
     */
    const usersCollection = "users";
    const categoriesCollection = "categories";
    const productsCollection = "products";
    const ordersCollection = "orders";

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        process.env.MONGO_URL = uri;
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

        await new Promise(resolve => setTimeout(resolve, timeForServerToStart));

        const mockAuthData = JSON.stringify({ 
            user: user1, 
            token: JWT.sign({ _id: user1._id }, process.env.JWT_SECRET, {
                expiresIn: "7d",
            })
        });

        localStorage.setItem('auth', mockAuthData);
    });

    beforeEach(async () => {
        await mongoose.connection.createCollection(usersCollection);
        await mongoose.connection.createCollection(categoriesCollection);
        await mongoose.connection.createCollection(productsCollection);
        await mongoose.connection.createCollection(ordersCollection);
        await user1.save();
        await user2.save();
        await category1.save();
        await category2.save();
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
        await mongoose.connection.dropCollection(categoriesCollection);
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
                        <MemoryRouter initialEntries={['/user/orders']}>
                            <Orders />
                        </MemoryRouter>
                    </SearchProvider>
                </CartProvider>
            </AuthProvider>
        );
        
        await waitFor(() => expect(document.title).toBe('Your Orders'));
        expect(await screen.findByText('All Orders')).toBeInTheDocument();

        // Header.js
        expect(screen.getByText('🛒 Virtual Vault')).toBeInTheDocument();
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Categories')).toBeInTheDocument();
        expect(screen.getByText('All Categories')).toBeInTheDocument();
        expect(screen.queryByText('Register')).not.toBeInTheDocument();
        expect(screen.queryByText('Login')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Halimah Yacob' })).toBeInTheDocument();
        const dashboardNavLink = screen.getByRole('link', { name: /dashboard/i });
        expect(dashboardNavLink).toHaveAttribute('href', '/dashboard/user');
        expect(screen.getByText('Logout')).toBeInTheDocument();
        expect(screen.getByText('Cart')).toBeInTheDocument();

        // SearchInput.js
        expect(screen.getByText('Search')).toBeInTheDocument();

        // UserMenu.js
        const dashboardHeader = screen.getByRole('heading', { name: /dashboard/i });
        expect(dashboardHeader).toBeInTheDocument();
        const profileNavLink = screen.getByRole('link', { name: /profile/i });
        expect(profileNavLink).toHaveAttribute('href', '/dashboard/user/profile');
        const ordersNavLink = screen.getByRole('link', { name: /orders/i });
        expect(ordersNavLink).toHaveAttribute('href', '/dashboard/user/orders');

        // Orders.js
        const numberOfOrders = 2;
        const allHashElements = await screen.findAllByText("#");
        expect(allHashElements.length).toBe(numberOfOrders);
        const allStatusElements = await screen.findAllByText("Status");
        expect(allStatusElements.length).toBe(numberOfOrders);
        const allBuyerElements = await screen.findAllByText("Buyer");
        expect(allBuyerElements.length).toBe(numberOfOrders);
        const allDateElements = await screen.findAllByText("date");
        expect(allDateElements.length).toBe(numberOfOrders);
        const allPaymentElements = await screen.findAllByText("Payment");
        expect(allPaymentElements.length).toBe(numberOfOrders);
        const allQuantityElements = await screen.findAllByText("Quantity");
        expect(allQuantityElements.length).toBe(numberOfOrders);
        
        const allOneTextElements = await screen.findAllByText("1");
        expect(allOneTextElements.length).toBe(2); // 1st index number and quantity of second order
        const allTwoTextElements = await screen.findAllByText("2");
        expect(allTwoTextElements.length).toBe(2); // Quantity of first order and 2nd index number
        expect(await screen.findByText(order1.status)).toBeInTheDocument();
        expect(await screen.findByText(order2.status)).toBeInTheDocument();
        const allUserNameElements = await screen.findAllByText(user1.name);
        expect(allUserNameElements.length).toBe(numberOfOrders + 1); // 1 for username in dropdown box
        const allDateValueElements = await screen.findAllByText(moment(order1.createdAt).fromNow());
        // Both orders are created at the same time at the start of running this test
        expect(allDateValueElements.length).toBe(numberOfOrders);
        expect(await screen.findByText(order1.payment.success ? "Success" : "Failed")).toBeInTheDocument();
        expect(await screen.findByText(order2.payment.success ? "Success" : "Failed")).toBeInTheDocument();
        // Quantity values have already been checked above

        for (let product of [product1, product2, product3]) {
            expect(await screen.findByAltText(product.name)).toBeInTheDocument();
            expect(await screen.findByText(product.name)).toBeInTheDocument();
            expect(await screen.findByText(renderProductDescription(product.description))).toBeInTheDocument();
            expect(await screen.findByText("Price : " + product.price)).toBeInTheDocument();
        }

        expect(screen.queryByText(otherOrder.status)).not.toBeInTheDocument();
        expect(screen.queryByAltText(product4.name)).not.toBeInTheDocument();
        expect(screen.queryByText(product4.name)).not.toBeInTheDocument();
        expect(screen.queryByText(renderProductDescription(product4.description))).not.toBeInTheDocument();
        expect(screen.queryByText("Price : " + product4.price)).not.toBeInTheDocument();

        // Footer.js
        expect(screen.getByText('About')).toBeInTheDocument();
        const aboutNavLink = screen.getByRole('link', { name: /about/i });
        const contactNavLink = screen.getByRole('link', { name: /contact/i });
        const privacyNavLink = screen.getByRole('link', { name: /privacy policy/i });
        expect(aboutNavLink).toHaveAttribute('href', '/about');
        expect(contactNavLink).toHaveAttribute('href', '/contact');
        expect(privacyNavLink).toHaveAttribute('href', '/policy');
    });
});