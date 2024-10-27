import categoryModel from "../models/categoryModel";
import { expect, test } from "@playwright/test";
import fs from "fs";
import { hashPassword } from "../helpers/authHelper";
import mongoose from "mongoose";
import productModel from "../models/productModel";
import userModel from "../models/userModel";

const userPassword = "safePassword";
const createUser = async () => {
    const passwordHash = await hashPassword(userPassword);
    const user = new userModel({
        name: "Halimah Yacob", 
        email: "yacob@gov.sg", 
        password: passwordHash, 
        phone: "88888888", 
        address: "Not Istana", 
        answer: "safeAnswer", 
        role: 0
    });
    return user;
};

const category1 = new categoryModel({
    name: "Technology", 
    slug: "technology"
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

const expirationDate = new Date();
expirationDate.setFullYear(expirationDate.getFullYear() + 2);
const month = String(expirationDate.getMonth() + 1).padStart(2, '0');
const year = String(expirationDate.getFullYear()).slice(-2);
const formattedExpirationDate = `${month}${year}`;

const creditCard = {
    cardNumber: "5555555555554444", 
    expirationDate: formattedExpirationDate, 
    cvv: "123"
};

const renderProductDescription = (productDescription) => {
    return productDescription.substring(0, 30);
};

test.describe("User can create order", () => {
    const usersCollection = "users";
    const categoriesCollection = "categories";
    const productsCollection = "products";
    const ordersCollection = "orders";
    
    let user;

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

        user = await createUser();
        await user.save();
        await category1.save();
        await product1.save();
        await product2.save();
    });

    test.afterEach(async () => {
        await mongoose.connection.collection(usersCollection).deleteMany({});
        await mongoose.connection.collection(categoriesCollection).deleteMany({});
        await mongoose.connection.collection(productsCollection).deleteMany({});
        await mongoose.connection.collection(ordersCollection).deleteMany({});
        await mongoose.disconnect();
    });

    /**
     * As this test involves making a payment with the same credit card for the same products which 
     * total to the same price, running this test multiple times within a short period of time will 
     * trigger Braintree's duplicate detection mechanism and fail the payment. Braintree's 
     * duplicate transaction detection feature automatically identifies and rejects transactions 
     * that appear to be identical to another recent transaction.
     * 
     * Thus, even though the order will be created, the payment object's success field will be 
     * false.
     * 
     * As such, the assertion lines checking for "Success" to be rendered in the UI 
     * await expect(page.getByRole('cell', { name: 'Success' })).toBeVisible() and 
     * expect(order.payment.success).toBe(true) will fail when the payment is unsuccessful and this 
     * test wil fail.
     * 
     * However, as we aren't testing the duplicate detection mechanism, this test will assume that 
     * the user is making this payment for the "first" time and should not be run multiple times in 
     * a short period of time.
     * 
     * Do note that this will be triggered when executing the test using npx plauwright test which 
     * will run the test 3 times (Chromium, Firefox, Webkit) in quick succession. As such, the 
     * browser in which the test is run in first will pass while the other two may fail. Thus, when 
     * running this test, it is recommended to run it in only one browser like so:
     * - npx playwright test tests/userCreateOrder.spec.mjs --browser=chromium
     * - npx playwright test tests/userCreateOrder.spec.mjs --browser=firefox
     * - npx playwright test tests/userCreateOrder.spec.mjs --browser=webkit
     * with sufficient time between each run. An estimated would be 1 minute between each run but 
     * this time may vary.
     */
    test("after making payment", async ({ page }) => {
        await page.goto("http://localhost:3000");

        // Login
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByPlaceholder('Enter Your Email ').click();
        await page.getByPlaceholder('Enter Your Email ').fill(user.email);
        await page.getByPlaceholder('Enter Your Password').click();
        await page.getByPlaceholder('Enter Your Password').fill(userPassword);
        await page.getByRole('button', { name: 'LOGIN' }).click();

        // Check that login was successful
        await expect(page.getByText('🙏login successfully')).toBeVisible();

        // Add product to cart
        await page.getByRole('button', { name: 'ADD TO CART' }).first().click();
        await page.getByRole('button', { name: 'ADD TO CART' }).nth(1).click();

        // Navigate to Cart
        await page.getByRole('link', { name: "Cart" }).click();

        // Check that products are displayed correctly in cart
        await expect(page.getByRole('img', { name: product1.name })).toBeVisible();
        await expect(page.getByText(product1.name)).toBeVisible();
        await expect(page.getByText(renderProductDescription(product1.description))).toBeVisible();
        await expect(page.getByText(product1.price)).toBeVisible();

        await expect(page.getByRole('img', { name: product2.name })).toBeVisible();
        await expect(page.getByText(product2.name)).toBeVisible();
        await expect(page.getByText(renderProductDescription(product2.description))).toBeVisible();
        await expect(page.getByText(product2.price)).toBeVisible();

        // Click on card payment
        await page.getByRole('button', { name: 'Paying with Card' }).click();

        // Fill in card details
        await page.locator('iframe[name="braintree-hosted-field-number"]').contentFrame().getByPlaceholder('•••• •••• •••• ••••').click();
        await page.locator('iframe[name="braintree-hosted-field-number"]').contentFrame().getByPlaceholder('•••• •••• •••• ••••').fill(creditCard.cardNumber);
        await page.locator('iframe[name="braintree-hosted-field-expirationDate"]').contentFrame().getByPlaceholder('MM/YY').click();
        await page.locator('iframe[name="braintree-hosted-field-expirationDate"]').contentFrame().getByPlaceholder('MM/YY').fill(creditCard.expirationDate);
        await page.locator('iframe[name="braintree-hosted-field-cvv"]').contentFrame().getByPlaceholder('•••').click();
        await page.locator('iframe[name="braintree-hosted-field-cvv"]').contentFrame().getByPlaceholder('•••').fill(creditCard.cvv);
        await page.getByRole('button', { name: 'Make Payment' }).click();

        // Check that payment was successful
        await expect(page.getByRole('button', { name: 'Ending in 4444 Mastercard' })).toBeVisible();
        await expect(page.getByText('Payment Completed Successfully')).toBeVisible();

        // Check that user has been redirected to Orders
        await expect(page).toHaveURL('/dashboard/user/orders');
        await expect(page.getByRole('heading', { name: 'All Orders' })).toBeVisible();

        // Check that order is displayed
        await expect(page.getByRole('columnheader', { name: '#' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Buyer' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'date' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Payment' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Quantity' })).toBeVisible();
        await expect(page.getByRole('cell', { name: '1' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Not Process' })).toBeVisible();
        await expect(page.getByRole('cell', { name: user.name })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'a few seconds ago' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Success' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 2 })).toBeVisible();

        // Check that products are displayed correctly
        await expect(page.getByRole('img', { name: product1.name })).toBeVisible();
        await expect(page.getByText(product1.name)).toBeVisible();
        await expect(page.getByText(renderProductDescription(product1.description))).toBeVisible();
        await expect(page.getByText(product1.price)).toBeVisible();

        await expect(page.getByRole('img', { name: product2.name })).toBeVisible();
        await expect(page.getByText(product2.name)).toBeVisible();
        await expect(page.getByText(renderProductDescription(product2.description))).toBeVisible();
        await expect(page.getByText(product2.price)).toBeVisible();
    });
});