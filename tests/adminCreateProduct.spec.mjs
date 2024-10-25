import { test, expect } from '@playwright/test';
import userModel from '../models/userModel.js';
import categoryModel from '../models/categoryModel.js';
import mongoose from "mongoose";

/**
This UI tests the E2E flow of an admin creating a product.
1. User logins as admin.
2. User enters Admin Dashboard.
3. User creates a product.
4. User views the newly created product under All Products and target category.
5. User creates another product.
6. User views the newly created product under All Products and target category.
*/

//Variables for setting up mongodb collections
const USER_COLLECTION = "users";
const CATEGORY_COLLECTION  = "categories";
const PRODUCT_COLLECTION = "products";

//Variables for logging in
const PASSWORD_UNHASHED = "password"
const PASSWORD_HASHED = "$2b$10$WAPTi0bcYFfJkncMUjER5eS8.xo3WNYHaorAx9LPXvbsmmBH3x6tS"


test.beforeEach(async () => {
    //Connect to the database
    await mongoose.connect(process.env.MONGO_URL);

    //Create users collection
    await mongoose.connection.createCollection(USER_COLLECTION);
    await mongoose.connection.createCollection(CATEGORY_COLLECTION);
    await mongoose.connection.createCollection(PRODUCT_COLLECTION);

    //Create admin account to log in with
    const adminUser = new userModel({
        name: 'Harry',
        email: 'harry@gmail.com',
        password: PASSWORD_HASHED,
        phone: '12345678',
        address: 'Hogwarts',
        answer: 'Quidditch',
        role: 1,
    })
    await adminUser.save();

    await new categoryModel({ name: 'dresses', slug: 'dresses' }).save();
    await new categoryModel({ name: 'toys', slug: 'toys' }).save();
    await new categoryModel({ name: 'books', slug: 'books' }).save();
});


test.afterEach(async () => {
    //Reset the collections
    await mongoose.connection.collection(USER_COLLECTION).deleteMany({});
    await mongoose.connection.collection(CATEGORY_COLLECTION).deleteMany({});
    await mongoose.connection.collection(PRODUCT_COLLECTION).deleteMany({});

    //Disconnect from the database
    await mongoose.disconnect();
});


test.describe('Admin should be able to create multiple valid products', () => {
    test('where initially no products present and admin creates multiple products', async ({ page }) => {

        //Visit website
        await page.goto('http://localhost:3000/');

        //Login to admin account
        await page.getByRole('link', { name: 'Login'}).click();
        await page.getByPlaceholder('Enter Your Email').fill('harry@gmail.com');
        await page.getByPlaceholder('Enter Your Password').click();
        await page.getByPlaceholder('Enter Your Password').fill(PASSWORD_UNHASHED);
        await page.getByRole('button', { name: 'LOGIN' }).click();

        //Verify that user has logged in
        await expect(page.getByText('🙏login successfully')).toBeVisible();
        await page.waitForSelector('.toast-message', { state: 'hidden', timeout: 5000 });
        await page.getByRole('button', { name: 'Harry' }).click();
        
        //Navigate to admin dashboard
        await page.getByRole('link', { name: 'Dashboard' }).click();

        //PRODUCT CREATION 1

        //Create new product
        await page.getByRole('link', { name: 'Create Product' }).click();

        //Fill up details
        const fileInput = await page.locator('input[type="file"][name="photo"]');
        await fileInput.setInputFiles("client/public/images/test-pdt-img-1.jpg");
        
        await page.getByPlaceholder('write a name').fill("Goblet of Fire");
        await page.getByPlaceholder('write a description').fill("Harry enters TriWizard tournament.");
        

        await page.locator('div.col-md-9 .form-select.mb-3').filter({ hasText: 'Select a category' }).click();
        const catOptions = await page.locator('.ant-select-item-option-content').allTextContents();
        await expect(catOptions.length).toBeGreaterThan(0);
        await page.locator('.ant-select-item-option-content').filter({ hasText: 'books' }).click();
        
        await page.locator('div.col-md-9 .form-select.mb-3').filter({ hasText: 'Select Shipping' }).click();
        const shipOptions = await page.locator('.ant-select-item-option-content').allTextContents();
        await expect(shipOptions.length).toBeGreaterThan(0);
        await page.locator('.ant-select-item-option-content').filter({ hasText: 'Yes' }).click();

        await page.getByPlaceholder('write a Price').fill('121');
        await page.getByPlaceholder('write a quantity').fill('11');

        await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
        
        //Go to products page and check if product is there
        await page.getByRole('link', { name: 'Products' }).click();
        await page.reload(); //refresh
        await expect(page.getByText('Goblet of Fire')).toBeVisible();
        await expect(page.getByText('Harry enters TriWizard tournament.')).toBeVisible();

        //PRODUCT CREATION 2
        
        //Create new product
        await page.getByRole('link', { name: 'Create Product' }).click();

        //Fill up details
        const fileInput2 = await page.locator('input[type="file"][name="photo"]');
        await fileInput2.setInputFiles("client/public/images/test-pdt-img-2.jpg");
        
        await page.getByPlaceholder('write a name').fill("Lavender Dress");
        await page.getByPlaceholder('write a description').fill("Soft purple fabric with tinge of gold.");
        

        await page.locator('div.col-md-9 .form-select.mb-3').filter({ hasText: 'Select a category' }).click();
        const catOptions2 = await page.locator('.ant-select-item-option-content').allTextContents();
        await expect(catOptions2.length).toBeGreaterThan(0);
        await page.locator('.ant-select-item-option-content').filter({ hasText: 'dresses' }).click();
        
        await page.locator('div.col-md-9 .form-select.mb-3').filter({ hasText: 'Select Shipping' }).click();
        const shipOptions2 = await page.locator('.ant-select-item-option-content').allTextContents();
        await expect(shipOptions2.length).toBeGreaterThan(0);
        await page.locator('.ant-select-item-option-content').filter({ hasText: 'No', hasValue: 0 }).click();

        await page.getByPlaceholder('write a Price').fill('456');
        await page.getByPlaceholder('write a quantity').fill('1');

        await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
        
        //Go to products page and check if product is there
        await page.getByRole('link', { name: 'Products' }).click();
        await page.reload(); //refresh
        await expect(page.getByText('Lavender Dress')).toBeVisible();
        await expect(page.getByText('Soft purple fabric with tinge of gold.')).toBeVisible();

        //Go to categories page and check both are shown

        //PRODUCT 1
        await page.getByRole('link', { name: 'Categories' }).click();
        await page.getByRole('link', { name: 'Books' }).click();
        await expect(page.getByText('Goblet of Fire')).toBeVisible();
        await expect(page.getByText('121')).toBeVisible();

        //PRODUCT 2
        await page.getByRole('link', { name: 'Categories' }).click();
        await page.getByRole('link', { name: 'Dresses' }).click();
        await expect(page.getByText('Lavender Dress')).toBeVisible();
        await expect(page.getByText('456')).toBeVisible();
    });
});
