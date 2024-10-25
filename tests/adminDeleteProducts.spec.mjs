import { test, expect } from '@playwright/test';
import userModel from '../models/userModel.js';
import categoryModel from '../models/categoryModel.js';
import productModel from '../models/productModel.js';
import mongoose from "mongoose";
import fs from 'fs'

/**
This UI tests the E2E flow of product deletion by admin
1. User logins as admin
2. User enters Admin Dashboard
3. User navigates to Products and views existing products
4. User deletes a product
5. User views updated product list under All Products
6. User checks categories' product lists for corresponding changes
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

    const dresses = await new categoryModel({ name: 'dress', slug: 'dress' }).save();
    const toys = await new categoryModel({ name: 'toys', slug: 'toys' }).save();
    const books = await new categoryModel({ name: 'books', slug: 'books' }).save();
    const shoes = await new categoryModel({ name: 'shoes', slug: 'shoes' }).save();

    const expectedBufferBook = fs.readFileSync('client/public/images/test-pdt-img-1.jpg');
    const expectedBufferDress = fs.readFileSync('client/public/images/test-pdt-img-2.jpg');
    const expectedBufferShoe = fs.readFileSync('client/public/images/test-pdt-img-3.jpg');
    const expectedBufferToy = fs.readFileSync('client/public/images/test-pdt-img-4.jpg');

    const novel = new productModel({
        name: 'Deathly Hallows',
        slug: 'deathly-hallows',
        description: 'Harry Potter last book',
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
        name: 'Pretty Dress',
        slug: 'pretty-dress',
        description: 'This is a beautiful dress',
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
        name: 'Polished Shoes',
        slug: 'polished-shoes',
        description: 'New Arrival Oxford Shoes',
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
        name: 'Soft Toys',
        slug: 'soft-toys',
        description: 'Soft Teddy Bear',
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


test.describe('Admin should be able to delete products', () => {
    test('where there are existing products and admin deletes some of them', async ({ page }) => {

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
        await expect(page.getByText('Pretty Dress')).toBeVisible();
        await expect(page.getByText('Polished Shoes')).toBeVisible();
        await expect(page.getByText('Soft Toys')).toBeVisible();

        //Check existing products correctly reflected in categories page
        //PRODUCT 1
        await page.getByRole('link', { name: 'Categories' }).click();
        await page.getByRole('link', { name: 'Books' }).click();
        await expect(page.getByText('Deathly Hallows')).toBeVisible();
        await expect(page.getByText('22')).toBeVisible();

        //PRODUCT 2
        await page.getByRole('link', { name: 'Categories' }).click();
        await page.getByRole('link', { name: 'Dress' }).click();
        await expect(page.getByText('Pretty Dress')).toBeVisible();
        await expect(page.getByText('123')).toBeVisible();

        //PRODUCT 3
        await page.getByRole('link', { name: 'Categories' }).click();
        await page.getByRole('link', { name: 'Shoes' }).click();
        await expect(page.getByText('Polished Shoes')).toBeVisible();
        await expect(page.getByText('32')).toBeVisible();

        //PRODUCT 4
        await page.getByRole('link', { name: 'Categories' }).click();
        await page.getByRole('link', { name: 'Toys' }).click();
        await expect(page.getByText('Soft Toys')).toBeVisible();
        await expect(page.getByText('112')).toBeVisible();
        
        //Go back to products page

        //Delete shoes
        await page.getByRole('button', { name: 'Harry' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Products' }).click();
        await page.locator('.product-link', { hasText: "Polished Shoes" }).click();
        page.on('dialog', async (dialog) => {
            if (dialog.type() === 'prompt' && dialog.message() === "Are You Sure want to delete this product ? ") {
              await dialog.accept('Yes'); 
            } else {
              await dialog.dismiss(); 
            }
          });
        await page.getByRole('button', { name: 'DELETE' }).click();

        //Check reflected in products page
        await page.getByRole('button', { name: 'Harry' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Products' }).click();
        await expect(page.getByText("Polished Shoes")).not.toBeVisible();

        //Confirm no other products affected
        await expect(page.getByText("Deathly Hallows")).toBeVisible();
        await expect(page.getByText("Soft Toys")).toBeVisible();
        await expect(page.getByText("Pretty Dress")).toBeVisible();

        //Confirm no products under shoes category
        await page.getByRole('link', { name: 'Categories' }).click();
        await page.getByRole('link', { name: 'All Categories' }).click();
        await page.getByRole('link', { name: 'Shoes' }).click(); 
        await expect(page.getByRole('heading', { name: 'Category - Shoes' })).toBeVisible();
        await expect(page.getByRole('heading', { name: '0 result found' })).toBeVisible();
    });
});
