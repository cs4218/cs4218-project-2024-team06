import { test, expect } from '@playwright/test';
import userModel from '../models/userModel.js';
import mongoose from "mongoose";

/**
This UI test aims to test the E2E flow of an admin creating a category.
1. User logins as admin.
2. User enters Admin Dashboard.
3. User creates a category.
4. User views the newly created category under All Categories.
5. User sees that no products are found within that category yet.
*/

//Variables for setting up mongodb collections
const USER_COLLECTION = "users"


//Variables for logging in
const PASSWORD_UNHASHED = "password"
const PASSWORD_HASHED = "$2b$10$WAPTi0bcYFfJkncMUjER5eS8.xo3WNYHaorAx9LPXvbsmmBH3x6tS"


test.beforeEach(async () => {
    //Connect to the database
    await mongoose.connect(process.env.MONGO_URL);

    //Create users collection
    await mongoose.connection.createCollection(USER_COLLECTION);

    //Create admin account to log in with
    const adminUser = new userModel({
        name: 'James',
        email: 'james@gmail.com',
        password: PASSWORD_HASHED,
        phone: '91234567',
        address: 'Sentosa',
        answer: 'Badminton',
        role: 1,
    })
    
    await adminUser.save();
});


test.afterEach(async () => {
    //Reset the collections
    await mongoose.connection.collection(USER_COLLECTION).deleteMany({});

    //Disconnect from the database
    await mongoose.disconnect();
});


test.describe('Admin should be able to create a category', () => {
    test('where the category should be initialised with no products', async ({ page }) => {
        //Give more time to run as there are 3 browsers for a test
        test.slow();

        //Visit website
        await page.goto('http://localhost:3000/');

        //Login to admin account
        await page.getByRole('link', { name: 'Login'}).click();
        await page.getByPlaceholder('Enter Your Email').fill('james@gmail.com');
        await page.getByPlaceholder('Enter Your Password').click();
        await page.getByPlaceholder('Enter Your Password').fill(PASSWORD_UNHASHED);
        await page.getByRole('button', { name: 'LOGIN' }).click();

        //Verify that user has logged in
        await expect(page.getByText('🙏login successfully')).toBeVisible();
        await page.getByRole('button', { name: 'James' }).click();
        
        //Navigate to admin dashboard
        await page.getByRole('link', { name: 'Dashboard' }).click();

        //Create new category
        await page.getByRole('link', { name: 'Create Category' }).click();
        await page.getByPlaceholder('Enter new category').fill('Shoes');
        await page.getByRole('button', { name: 'Submit' }).click();

        //Check if category is successfully created
        await expect(page.getByText('Shoes is created')).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Shoes' })).toBeVisible(); //Should appear in current page
        await page.getByRole('link', { name: 'Categories' }).click();
        await page.getByRole('link', { name: 'All Categories' }).click();
        await page.getByRole('link', { name: 'Shoes' }).click(); //Should appear in All Categories page
        
        //Check that no products are created under this new category yet
        await expect(page.getByRole('heading', { name: 'Category - Shoes' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Category - Shoes' })).toBeVisible();
        await expect(page.getByRole('heading', { name: '0 result found' })).toBeVisible();
    });
});
