import { test, expect } from '@playwright/test';
import userModel from '../models/userModel.js';
import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";
import mongoose from "mongoose";
import { CATEGORY_DATA, PRODUCT_DATA } from "../data/index.js";

/**
This UI test aims to test the E2E flow of a user searching a product using the search bar and viewing information about
the product that is found.

1. User logins.
2. User enters a search term in the search bar.
3. User views more details about a result from the search.
4. User decides to add the result to his cart after viewing details.
*/

//Variables for setting up mongodb collections
const USER_COLLECTION = "users"
const CATEGORIES_COLLECTION = "categories"
const PRODUCTS_COLLECTION = "products"

//Variables for logging in
const PASSWORD_UNHASHED = "password"
const PASSWORD_HASHED = "$2b$10$WAPTi0bcYFfJkncMUjER5eS8.xo3WNYHaorAx9LPXvbsmmBH3x6tS"

//Variable for keeping track of category IDs
const CATEGORY_IDS = {};


test.beforeEach(async () => {
    //Connect to the database
    await mongoose.connect(process.env.MONGO_URL);

    //Create the collections
    await mongoose.connection.createCollection(USER_COLLECTION);
    await mongoose.connection.createCollection(CATEGORIES_COLLECTION);
    await mongoose.connection.createCollection(PRODUCTS_COLLECTION);

    //Create account to log in with
    const adminUser = new userModel({
        name: 'James',
        email: 'james@gmail.com',
        password: PASSWORD_HASHED,
        phone: '91234567',
        address: 'Sentosa',
        answer: 'Badminton',
        role: 0,
    })
    await adminUser.save();

    //Create categories to work with
    for (const categoryData of CATEGORY_DATA) {
        const category = new categoryModel(categoryData);
        const savedCategory = await category.save();

        CATEGORY_IDS[categoryData.name] = savedCategory._id;
    }

    //Create products to work with
    for (const productData of PRODUCT_DATA) {
        productData['category'] = CATEGORY_IDS[productData['category']];
        const product = new productModel(productData);
        await product.save();
    }
});


test.afterEach(async () => {
    //Reset the collections
    await mongoose.connection.collection(USER_COLLECTION).deleteMany({});
    await mongoose.connection.collection(CATEGORIES_COLLECTION).deleteMany({});
    await mongoose.connection.collection(PRODUCTS_COLLECTION).deleteMany({});

    //Disconnect from the database
    await mongoose.disconnect();
});


test.describe('Admin should be able to create a category', () => {
    test('where the category should be initialised with no products', async ({ page }) => {
        //Give more time to run as there are 3 browsers for a test
        // test.slow();

        //Visit website
        await page.goto('http://localhost:3000/');

        // //Login to admin account
        // await page.getByRole('link', { name: 'Login'}).click();
        // await page.getByPlaceholder('Enter Your Email').fill('james@gmail.com');
        // await page.getByPlaceholder('Enter Your Password').click();
        // await page.getByPlaceholder('Enter Your Password').fill(PASSWORD_UNHASHED);
        // await page.getByRole('button', { name: 'LOGIN' }).click();

        //Verify that user has logged in
        await expect(page.getByText('🙏login successfully')).toBeVisible();
        // await page.getByRole('button', { name: 'James' }).click();
        
        // //Navigate to admin dashboard
        // await page.getByRole('link', { name: 'Dashboard' }).click();

        // //Create new category
        // await page.getByRole('link', { name: 'Create Category' }).click();
        // await page.getByPlaceholder('Enter new category').fill('Shoes');
        // await page.getByRole('button', { name: 'Submit' }).click();

        // //Check if category is successfully created
        // await expect(page.getByText('Shoes is created')).toBeVisible();
        // await expect(page.getByRole('cell', { name: 'Shoes' })).toBeVisible(); //Should appear in current page
        // await page.getByRole('link', { name: 'Categories' }).click();
        // await page.getByRole('link', { name: 'All Categories' }).click();
        // await page.getByRole('link', { name: 'Shoes' }).click(); //Should appear in All Categories page
        
        // //Check that no products are created under this new category yet
        // await expect(page.getByRole('heading', { name: 'Category - Shoes' })).toBeVisible();
        // await expect(page.getByRole('heading', { name: 'Category - Shoes' })).toBeVisible();
        // await expect(page.getByRole('heading', { name: '0 result found' })).toBeVisible();
    });
});
