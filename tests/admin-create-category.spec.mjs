import { test, expect } from '@playwright/test';
import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server'
import userModel from '../models/userModel.js';

//Variables for setting up mongodb collections
const USER_COLLECTION = "users"
const CATEGORIES_COLLECTION = "categories"
const PRODUCTS_COLLECTION = "products"

/**
This UI test aims to test the E2E flow of an admin creating a category.
1. User logins as admin.
2. User enters Admin Dashboard.
3. User creates a category.
4. User views the newly created category under All Categories.
5. User sees that no products are found within that category yet.
*/


//Set up a test database for UI testing
test.beforeAll(async () => {
    // //Create the in-memory MongoDB server and connect to it
    // mongodbServer = await MongoMemoryServer.create();
    // const mongodbUri = mongodbServer.getUri();
    // process.env.MONGO_URL = mongodbUri;
    // await mongoose.connect(mongodbUri);


    // //Create the collections to work with
    // await mongoose.connection.createCollection(USER_COLLECTION);
    // await mongoose.connection.createCollection(CATEGORIES_COLLECTION);
    // await mongoose.connection.createCollection(PRODUCTS_COLLECTION);


    // //Create admin account to log in with
    // const adminUser = new userModel({
    //     name: 'James',
    //     email: 'james@gmail.com',
    //     password: 'password',
    //     phone: '91234567',
    //     address: 'Sentosa',
    //     answer: 'Badminton',
    //     role: 1,
    // })
    // await adminUser.save();
});


test.afterAll(async () => {
    // //Reset the collections
    // await mongoose.connection.dropCollection(USER_COLLECTION);
    // await mongoose.connection.dropCollection(CATEGORIES_COLLECTION);
    // await mongoose.connection.dropCollection(PRODUCTS_COLLECTION);

    // //Reset the database
    // await mongoose.connection.dropDatabase();

    // //Disconnect from the in-memory MongoDB server
    // await mongoose.disconnect();
    // await mongodbServer.stop();
});


test.describe('User should be able to create a category', () => {
    test('where the category should be initialised with no products', async ({ page }) => {
        
        //Visit website
        await page.goto('http://localhost:3000/');

        //Login to admin account
        await page.getByRole('link', { name: 'Login'}).click();
        await page.getByPlaceholder('Enter Your Email').fill('james@gmail.com');
        await page.getByPlaceholder('Enter Your Password').click();
        await page.getByPlaceholder('Enter Your Password').fill('password');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        //Verify that user has logged in
        // await page.getByRole('button', { name: 'James' }).click();
    });
});
