import { test, expect } from '@playwright/test';
import userModel from '../models/userModel.js';
import mongoose from "mongoose";

/**
This UI test aims to test the E2E flow of a user updating his profile.
1. User logins.
2. User clicks on his name and enters Dashboard.
3. User clicks on profile.
4. User updates his name, password, phone number and address.
5. User logs out and logs in again with updated password.
6. User views his updated information in his profile.
*/

//Variables for setting up mongodb collections
const USER_COLLECTION = "users"


//Variables for logging in
const ORIGINAL_PASSWORD_UNHASHED = "password";
const ORIGINAL_PASSWORD_HASHED = "$2b$10$WAPTi0bcYFfJkncMUjER5eS8.xo3WNYHaorAx9LPXvbsmmBH3x6tS";
const NEW_PASSWORD_UNHASHED = "new_password";


//Variables for original and updated user data
const USER_ORIGINAL_DATA = {
    name: 'James',
    email: 'james@gmail.com',
    password: ORIGINAL_PASSWORD_HASHED,
    phone: '91234567',
    address: 'Sentosa',
    answer: 'Badminton',
    role: 0,
}

const USER_NEW_DATA = {
    name: 'James Tan',
    email: 'james@gmail.com',
    password: NEW_PASSWORD_UNHASHED,
    phone: '98765432',
    address: 'Changi',
    answer: 'Badminton',
    role: 0,
}


test.beforeEach(async () => {
    //Connect to the database
    await mongoose.connect(process.env.MONGO_URL);

    //Create users collection
    await mongoose.connection.createCollection(USER_COLLECTION);

    //Create user account to log in with
    const newUser = new userModel(USER_ORIGINAL_DATA)
    await newUser.save();
});


test.afterEach(async () => {
    //Reset the collections
    await mongoose.connection.collection(USER_COLLECTION).deleteMany({});

    //Disconnect from the database
    await mongoose.disconnect();
});


test.describe('User should be able to update his profile', () => {
    test('where he can change name, password, phone number, and address', async ({ page }) => {
        //Give more time to run as there are 3 browsers for a test
        test.slow();

        //Visit website
        await page.goto('http://localhost:3000/');

        //Login to user account
        await page.getByRole('link', { name: 'Login'}).click();
        await page.getByPlaceholder('Enter Your Email').fill(USER_ORIGINAL_DATA.email);
        await page.getByPlaceholder('Enter Your Password').click();
        await page.getByPlaceholder('Enter Your Password').fill(ORIGINAL_PASSWORD_UNHASHED);
        await page.getByRole('button', { name: 'LOGIN' }).click();

        //Verify that user has logged in
        await expect(page.getByText('🙏login successfully')).toBeVisible();
        await page.getByRole('button', { name: 'James' }).click();
        
        //Navigate to dashboard and check that user's information is present
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await expect(page.getByRole('heading', { name: USER_ORIGINAL_DATA.name, exact: true })).toBeVisible();
        await expect(page.getByRole('heading', { name: USER_ORIGINAL_DATA.email })).toBeVisible();
        await expect(page.getByRole('heading', { name: USER_ORIGINAL_DATA.address })).toBeVisible();

        //Verify that original user information is populated in Profile page
        await page.getByRole('link', { name: 'Profile' }).click();
        await expect(page.getByRole('heading', { name: 'USER PROFILE' })).toBeVisible();
        expect(await page.getByPlaceholder('Enter Your Name').inputValue()).toBe(USER_ORIGINAL_DATA.name);
        expect(await page.getByPlaceholder('Enter Your Email').inputValue()).toBe(USER_ORIGINAL_DATA.email);
        expect(await page.getByPlaceholder('Enter Your Password').inputValue()).toBe('');
        expect(await page.getByPlaceholder('Enter Your Phone').inputValue()).toBe(USER_ORIGINAL_DATA.phone);
        expect(await page.getByPlaceholder('Enter Your Address').inputValue()).toBe(USER_ORIGINAL_DATA.address);

        //Check that email field is uneditable
        await expect(page.getByPlaceholder('Enter Your Email')).toBeDisabled();

        //Change user information for editable fields
        await page.getByPlaceholder('Enter Your Name').click();
        await page.getByPlaceholder('Enter Your Name').fill(USER_NEW_DATA.name);
        await page.getByPlaceholder('Enter Your Password').click();
        await page.getByPlaceholder('Enter Your Password').fill(USER_NEW_DATA.password);
        await page.getByPlaceholder('Enter Your Phone').click();
        await page.getByPlaceholder('Enter Your Phone').fill(USER_NEW_DATA.phone);
        await page.getByPlaceholder('Enter Your Address').click();
        await page.getByPlaceholder('Enter Your Address').fill(USER_NEW_DATA.address);

        //Submit updated user information
        await page.getByRole('button', { name: 'Update' }).click();
        await expect(page.getByText('Profile Updated Successfully')).toBeVisible();

        //Log out
        await page.getByRole('button', { name: 'James Tan' }).click(); //Name should be updated
        await page.getByRole('link', { name: 'Logout' }).click(); //Name should be updated

        //Log back in with new password
        await page.getByPlaceholder('Enter Your Email').fill(USER_ORIGINAL_DATA.email); //Email should not have changed
        await page.getByPlaceholder('Enter Your Password').click();
        await page.getByPlaceholder('Enter Your Password').fill(USER_NEW_DATA.password); //Login with new password
        await page.getByRole('button', { name: 'LOGIN' }).click();

        //Verify that user can log in
        await expect(page.getByText('🙏login successfully')).toBeVisible();
        await page.getByRole('button', { name: 'James Tan' }).click();
        
        //Navigate to dashboard and check that user's updated information is present
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await expect(page.getByRole('heading', { name: USER_NEW_DATA.name, exact: true })).toBeVisible();
        await expect(page.getByRole('heading', { name: USER_NEW_DATA.email })).toBeVisible();
        await expect(page.getByRole('heading', { name: USER_NEW_DATA.address })).toBeVisible();

        //Verify that updated user information is populated in Profile page
        await page.getByRole('link', { name: 'Profile' }).click();
        await expect(page.getByRole('heading', { name: 'USER PROFILE' })).toBeVisible();
        expect(await page.getByPlaceholder('Enter Your Name').inputValue()).toBe(USER_NEW_DATA.name);
        expect(await page.getByPlaceholder('Enter Your Email').inputValue()).toBe(USER_ORIGINAL_DATA.email); //Email should not have changed
        expect(await page.getByPlaceholder('Enter Your Password').inputValue()).toBe('');
        expect(await page.getByPlaceholder('Enter Your Phone').inputValue()).toBe(USER_NEW_DATA.phone);
        expect(await page.getByPlaceholder('Enter Your Address').inputValue()).toBe(USER_NEW_DATA.address);
    });
});
