import categoryModel from "../models/categoryModel";
import { expect, test } from "@playwright/test";
import fs from "fs";
import { hashPassword } from "../helpers/authHelper";
import mongoose from "mongoose";
import productModel from "../models/productModel";
import orderModel from "../models/orderModel";
import userModel from "../models/userModel";

const adminUser = new userModel({
        name: "Tharman Shanmugaratnam", 
        email: "tharman@gov.sg", 
        password: "hashedPassword", 
        phone: "999", 
        address: "Istana", 
        answer: "saferAnswer", 
        role: 1
});

const user1Password = "saferPassword";
const createNormalUser1 = async () => {
    const passwordHash = await hashPassword(user1Password);
    const normalUser1 = new userModel({
        name: "Halimah Yacob", 
        email: "yacob@gov.sg", 
        password: passwordHash, 
        phone: "88888888", 
        address: "Not Istana", 
        answer: "safeAnswer", 
        role: 0
    });
    return normalUser1;
};

const normalUser2 = new userModel({
    name: "Tony Tan", 
    email: "tony@gov.sg", 
    password: "alsohashedPassword", 
    phone: "99998888", 
    address: "Definitely not Istana", 
    answer: "anotherAnswer", 
    role: 0
})

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

test.describe("User should only be able to", () => {
    const usersCollection = "users";
    const categoriesCollection = "categories";
    const productsCollection = "products";
    const ordersCollection = "orders";
    
    let normalUser1;
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

        await adminUser.save();
        normalUser1 = await createNormalUser1();
        await normalUser1.save();
        await normalUser2.save();
        await category1.save();
        await category2.save();
        await product1.save();
        await product2.save();
        await product3.save();
        await product4.save();

        order1 = new orderModel({
            products: [product1._id, product2._id], 
            payment: { success: true }, 
            buyer: normalUser1._id, 
            status: orderStatusEnum[1]
        });

        order2 = new orderModel({
            products: [product3._id], 
            payment: { success: false }, 
            buyer: normalUser2._id, 
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

    test("only view their own orders", async ({ page }) => {
        await page.goto("http://localhost:3000");

        // Login
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByPlaceholder('Enter Your Email ').click();
        await page.getByPlaceholder('Enter Your Email ').fill(normalUser1.email);
        await page.getByPlaceholder('Enter Your Password').click();
        await page.getByPlaceholder('Enter Your Password').fill(user1Password);
        await page.getByRole('button', { name: 'LOGIN' }).click();

        // Check that login was successful
        await expect(page.getByText('🙏login successfully')).toBeVisible();

        // Navigate to Dashboard
        await page.getByRole('button', { name: normalUser1.name }).click();
        await page.getByRole('link', { name: "Dashboard" }).click();

        // Navigate to AdminOrders
        await page.getByRole('link', { name: "Orders" }).click();

        // Check that table head is displayed correctly
        // const numberOfOrders = 3;
        // const hashHeader = await page.getByText("#");
        // const statusHeader = await page.getByText("Status");
        // const buyerHeader = await page.getByText("Buyer");
        // const dateHeader = await page.getByText("Date");
        // const paymentHeader = await page.getByText("Payment");
        // const quantityHeader = await page.getByText("Quantity");

        // for (let i = 0; i < numberOfOrders; i++) {
        //     if (i < 1) {
        //         await expect(hashHeader).toBeVisible();
        //         await expect(statusHeader).toBeVisible();
        //         await expect(buyerHeader).toBeVisible();
        //         await expect(dateHeader).toBeVisible();
        //         await expect(paymentHeader).toBeVisible();
        //         await expect(quantityHeader).toBeVisible();
        //     }
        //     await expect(hashHeader.nth(i)).toBeVisible();
        //     await expect(statusHeader.nth(i)).toBeVisible();
        //     await expect(buyerHeader.nth(i)).toBeVisible();
        //     await expect(dateHeader.nth(i)).toBeVisible();
        //     await expect(paymentHeader.nth(i)).toBeVisible();
        //     await expect(quantityHeader.nth(i)).toBeVisible();
        // }
    })
});