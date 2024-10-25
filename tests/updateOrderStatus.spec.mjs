import categoryModel from "../models/categoryModel.js";
import { expect, test } from '@playwright/test';
import fs from "fs";
import { hashPassword } from "../helpers/authHelper.js";
import mongoose from "mongoose";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";

const adminPassword = "saferPassword";
const createAdminUser = async () => {
    const passwordHash = await hashPassword(adminPassword);
    const adminUser = new userModel({
        name: "Tharman Shanmugaratnam", 
        email: "tharman@gov.sg", 
        password: passwordHash, 
        phone: "999", 
        address: "Istana", 
        answer: "saferAnswer", 
        role: 1
    });
    return adminUser;
};

const normalUser = new userModel({
    name: "Halimah Yacob", 
    email: "yacob@gov.sg", 
    password: "hashedPassword", 
    phone: "88888888", 
    address: "Not Istana", 
    answer: "safeAnswer", 
    role: 0
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
    photo: {
          data: fs.readFileSync("./data/images/technology/keychron_q2.jpg"),
          contentType: "image/jpg",
    },
    shipping: false
});

const product2 = new productModel({
    name: "Keychron K6", 
    slug: "keychron_k6", 
    description: "Amazing keyboard while not emptying your wallet",  
    price: 100, 
    category: category1._id,  
    quantity: 5, 
    photo: {
          data: fs.readFileSync("./data/images/technology/keychron_k6.jpg"),
          contentType: "image/jpg",
    },
    shipping: false
});

const product3 = new productModel({
    name: "Logitech Mouse", 
    slug: "logitech_mouse", 
    description: "Not the animal, but the computer accessory",  
    price: 50, 
    category: category1._id,   
    quantity: 20, 
    photo: {
          data: fs.readFileSync("./data/images/technology/logitech_mouse.jpg"),
          contentType: "image/jpg",
    },
    shipping: true
});

const product4 = new productModel({
    name: "Shirt", 
    slug: "shirt", 
    description: "To be worn on the upper body",  
    price: 30, 
    category: category2._id,  
    quantity: 15, 
    photo: {
          data: fs.readFileSync("./data/images/fashion/shirt.jpg"),
          contentType: "image/jpg",
    },
    shipping: true
});

const orderStatusEnum = ["Not Process", "Processing", "Shipped", "deliverd", "cancel"];

test.describe("Admin should be able to view orders and update order statuses of", () => {
    const usersCollection = "users";
    const categoriesCollection = "categories";
    const productsCollection = "products";
    const ordersCollection = "orders";

    let adminUser;
    let order1, order2, order3;
    
    test.beforeEach(async () => {
        await mongoose.connect(process.env.MONGO_URL);
        await mongoose.connection.createCollection(usersCollection);
        await mongoose.connection.createCollection(categoriesCollection);
        await mongoose.connection.createCollection(productsCollection);
        await mongoose.connection.createCollection(ordersCollection);

        await mongoose.connection.collection(usersCollection).deleteMany({});
        await mongoose.connection.collection(categoriesCollection).deleteMany({});
        await mongoose.connection.collection(productsCollection).deleteMany({});
        await mongoose.connection.collection(ordersCollection).deleteMany({});

        adminUser = await createAdminUser();

        await adminUser.save();
        await normalUser.save();
        await category1.save();
        await category2.save();
        await product1.save();
        await product2.save();
        await product3.save();
        await product4.save();

        order1 = new orderModel({
            products: [product1._id, product2._id], 
            payment: { success: true }, 
            buyer: normalUser._id, 
            status: orderStatusEnum[1]
        });

        order2 = new orderModel({
            products: [product3._id], 
            payment: { success: false }, 
            buyer: normalUser._id, 
            status: orderStatusEnum[4]
        });

        order3 = new orderModel({
            products: [product4._id], 
            payment: { success: true }, 
            buyer: adminUser._id, 
            status: orderStatusEnum[3]
        });

        await order1.save();
        await order2.save();
        await order3.save();
    });

    test.afterEach(async () => {
        await mongoose.connection.collection(usersCollection).deleteMany({});
        await mongoose.connection.collection(categoriesCollection).deleteMany({});
        await mongoose.connection.collection(productsCollection).deleteMany({});
        await mongoose.connection.collection(ordersCollection).deleteMany({});
        await mongoose.disconnect();
    });

    /**
     * This test will fail as getAllOrdersController is not implemented correctly. Line 226 of 
     * authController.js belongs to the getAllOrdersController function. sort({ createdAt: "-1" }) 
     * is not implemented correctly. The correct syntax is sort({ createdAt: -1 }) where the 
     * parameter is a number and not a string. Thus, everything up till navigating to AdminOrders 
     * will pass. Since there is a bug in the getAllOrdersController function, the API call for all 
     * orders in AdminOrder.js line 24 will fail and no orders will be displayed. Thus, everything 
     * after navigating to AdminOrders in this test, which checks that all orders in the database 
     * are displayed and that the status can be edited, will fail.
     */
    test.fail("all orders in the orders database", async ({ page }) => {
        await page.goto('http://localhost:3000/');

        // Login
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByPlaceholder('Enter Your Email ').click();
        await page.getByPlaceholder('Enter Your Email ').fill(adminUser.email);
        await page.getByPlaceholder('Enter Your Password').click();
        await page.getByPlaceholder('Enter Your Password').fill(adminPassword);
        await page.getByRole('button', { name: 'LOGIN' }).click();

        // Check that login was successful
        await expect(page.getByText('🙏login successfully')).toBeVisible();

        // Navigate to AdminDashboard
        await page.getByRole('button', { name: adminUser.name }).click();
        await page.getByRole('link', { name: "Dashboard" }).click();

        // Navigate to AdminOrders
        await page.getByRole('link', { name: "Orders" }).click();

        // Check that products from all orders are displayed
        await expect(page.getByText("Keychron Q2")).toBeVisible();
        await expect(page.getByText("Keychron K6")).toBeVisible();
        await expect(page.getByText("Logitech Mouse")).toBeVisible();
        await expect(page.getByText("Shirt")).toBeVisible();

        // Check that all order statuses are displayed
        await expect(page.getByText(orderStatusEnum[1])).toBeVisible();
        await expect(page.getByText(orderStatusEnum[4])).toBeVisible();
        await expect(page.getByText(orderStatusEnum[3])).toBeVisible();

        // Find order status dropdown of order 2
        const dropdown = await page.getByText(orderStatusEnum[4]);
        await dropdown.click();
        await page.getByTitle(orderStatusEnum[2]).click();

        // Check that order status has been updated
        await expect(page.locator('#root').getByTitle(orderStatusEnum[2])).toBeVisible();

        // Check that other order statuses are still displayed
        await expect(page.locator('#root').getByTitle(orderStatusEnum[1])).toBeVisible();
        await expect(page.locator('#root').getByTitle(orderStatusEnum[3])).toBeVisible();

        // Check that order status of order 2 has been updated in the database
        const updatedOrder = await orderModel.findById(order2._id);
        expect(updatedOrder.status).toBe(orderStatusEnum[2]);

        // Check that order status of other orders are still the same in the database
        const order1InDB = await orderModel.findById(order1._id);
        const order3InDB = await orderModel.findById(order3._id);
        expect(order1InDB.status).toBe(orderStatusEnum[1]);
        expect(order3InDB.status).toBe(orderStatusEnum[3]);
    });
});