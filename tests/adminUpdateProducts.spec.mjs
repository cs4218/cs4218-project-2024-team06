import { test, expect } from '@playwright/test';
import userModel from '../models/userModel.js';
import categoryModel from '../models/categoryModel.js';
import productModel from '../models/productModel.js';
import mongoose from "mongoose";
import fs from 'fs'

/**
This UI tests the E2E flow of product update by admin
1. User logins as admin.
2. User enters Admin Dashboard.
3. User navigates to Products and views existing products.
4. User updates products
5. User views updated product list on Products
6. User checks categories' product lists for corresponding changes.
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

    const dresses = await new categoryModel({ name: 'Dresses', slug: 'dress' }).save();
    const toys = await new categoryModel({ name: 'Toys', slug: 'toys' }).save();
    const books = await new categoryModel({ name: 'Books', slug: 'books' }).save();
    const shoes = await new categoryModel({ name: 'Shoes', slug: 'shoes' }).save();

    const expectedBufferBook = fs.readFileSync('client/public/images/test-pdt-img-1.jpg');
    const expectedBufferDress = fs.readFileSync('client/public/images/test-pdt-img-2.jpg');
    const expectedBufferShoe = fs.readFileSync('client/public/images/test-pdt-img-3.jpg');
    const expectedBufferToy = fs.readFileSync('client/public/images/test-pdt-img-4.jpg');

    const novel = new productModel({
        name: 'Deathly Hallows',
        slug: 'deathly-hallows',
        description: 'Harry fights Voldemort.',
        price: 22,
        category: books,
        quantity: 2,
        photo: {
            data: expectedBufferBook,
            contentType: 'image/jpeg',
        },
        shipping: false,
    }).save();

    const shirt = new productModel({
        name: 'Summer Sensation',
        slug: 'summer-sensation',
        description: 'A floral dress with a sprinkle of gold.',
        price: 123,
        category: dresses,
        quantity: 10,
        photo: {
            data: expectedBufferDress,
            contentType: 'image/jpeg',
        },
        shipping: true,
    }).save();

    const sneakers = new productModel({
        name: 'Formal Oxfords',
        slug: 'formal-oxfords',
        description: 'Polished classic wear for office.',
        price: 32,
        category: shoes,
        quantity: 43,
        photo: {
            data: expectedBufferShoe,
            contentType: 'image/jpeg',
        },
        shipping: false,
    }).save();

    const plushie = new productModel({
        name: 'Happy Teddy',
        slug: 'happy-teddy',
        description: 'Freddy the joyous bear.',
        price: 112,
        category: toys,
        quantity: 3,
        photo: {
            data: expectedBufferToy,
            contentType: 'image/jpeg',
        },
        shipping: true,
    }).save();

});


test.afterEach(async () => {
    //Reset the collections
    await mongoose.connection.collection(USER_COLLECTION).deleteMany({});
    await mongoose.connection.collection(CATEGORY_COLLECTION).deleteMany({});
    await mongoose.connection.collection(PRODUCT_COLLECTION).deleteMany({});

    //Disconnect from the database
    await mongoose.disconnect();
});


test.describe('Admin should be able to update products', () => {
    test('where there are existing products and admin updates products', async ({ page }) => {

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

        //Check existing products correctly reflected in products page
        await page.getByRole('link', { name: 'Products' }).click();
        await expect(page.getByText('Deathly Hallows')).toBeVisible();
        await expect(page.getByText('Summer Sensation')).toBeVisible();
        await expect(page.getByText('Formal Oxfords')).toBeVisible();
        await expect(page.getByText('Happy Teddy')).toBeVisible();

        //Check existing products correctly reflected in categories' page

        //PRODUCT 1
        await page.getByRole('link', { name: 'Categories' }).click();
        await page.getByRole('link', { name: 'Books' }).click();
        await expect(page.getByText('Deathly Hallows')).toBeVisible();
        await expect(page.getByText('22')).toBeVisible();

        //PRODUCT 2
        await page.getByRole('link', { name: 'Categories' }).click();
        await page.getByRole('link', { name: 'Dresses' }).click();
        await expect(page.getByText('Summer Sensation')).toBeVisible();
        await expect(page.getByText('123')).toBeVisible();

        //PRODUCT 3
        await page.getByRole('link', { name: 'Categories' }).click();
        await page.getByRole('link', { name: 'Shoes' }).click();
        await expect(page.getByText('Formal Oxfords')).toBeVisible();
        await expect(page.getByText('32')).toBeVisible();

        //PRODUCT 4
        await page.getByRole('link', { name: 'Categories' }).click();
        await page.getByRole('link', { name: 'Toys' }).click();
        await expect(page.getByText('Happy Teddy')).toBeVisible();
        await expect(page.getByText('112')).toBeVisible();
        
        //Go back to product page

        //Update product for discount sale
        await page.getByRole('button', { name: 'Harry' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Products' }).click();
        await page.locator('.product-link', { hasText: "Happy Teddy" }).click();
        
        //Check it shows existing data correctly
        await expect(page.locator('input[placeholder="write a name"]')).toHaveValue('Happy Teddy'); //Changed
        await expect(page.locator('input[placeholder="write a Price"]')).toHaveValue('112'); //Changed to 56
        await expect(page.locator('textarea[placeholder="write a description"]')).toHaveValue('Freddy the joyous bear.'); //Changed
        await expect(page.locator('input[placeholder="write a quantity"]')).toHaveValue('3');; // no change
        await expect(page.getByText('Yes')).toBeVisible(); //shipping - no change

        await page.locator('input[placeholder="write a name"]').fill('Laughing George');
        await page.locator('input[placeholder="write a Price"]').fill('56');
        await page.locator('textarea[placeholder="write a description"]').fill('Renamed toy with a lower price!');

        await page.getByRole('button', { name: 'UPDATE' }).click();

        //Original implementation erraneous: hence, we directly navigate to make sure intended functionality is tested for
        //Check reflected in products page
        await page.getByRole('button', { name: 'Harry' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Products' }).click();
        await expect(page.getByText("Happy Teddy")).not.toBeVisible();
        await expect(page.getByText("Laughing George")).toBeVisible();
        await expect(page.getByText("Freddy the joyous bear.")).not.toBeVisible();
        await expect(page.getByText("Renamed toy with a lower price!")).toBeVisible();

        //Confirm no other products affected
        await expect(page.getByText("Deathly Hallows")).toBeVisible();
        await expect(page.getByText("Formal Oxfords")).toBeVisible();
        await expect(page.getByText("Summer Sensation")).toBeVisible();

        //Confirm changes under toys category
        await page.getByRole('link', { name: 'Categories' }).click();
        await page.getByRole('link', { name: 'All Categories' }).click();
        await page.getByRole('link', { name: 'Toys' }).click(); 
        await expect(page.getByRole('heading', { name: 'Category - Toys' })).toBeVisible();
        await expect(page.getByText('Laughing George')).toBeVisible();
        await expect(page.getByText('56')).toBeVisible();
    });
});
