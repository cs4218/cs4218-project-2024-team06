import { test, expect } from "@playwright/test";
const { MongoClient, ObjectId } = require('mongodb');
import dotenv from "dotenv";

dotenv.config();

let db;
let client;

let email = generateRandomEmail();

test.beforeAll(async () => {
	// @ts-ignore
	client = new MongoClient(process.env.MONGO_URL); 
	await client.connect();
	db = client.db("ecommerce-test");

    const book = {
        name: 'best-book',
        slug: 'book-slug',
        description: 'this is the best book',
        price: 18,
        // @ts-ignore
        category: new ObjectId('64b0c0f9a4b1a33d8e4a0d0e'), // MongoDB ObjectId
        quantity: 1,
        photo: {
            data: Buffer.from('sample photo data', 'utf-8'),
            contentType: 'image/jpeg',
        },
        shipping: false,
    };

    const user = {
        _id: new ObjectId("671bed1e2db10f4ecd49200a"),
        name: "testing name",
        email: email,
        password: "$2b$10$GGzM2c9LwEUxio8qHHnd9ev9g9rsAG8m1XYKEkvX9EZeAPgxFWfTC",
        phone: "99999999",
        address: "test addresss",
        answer: "running",
        role: 0,
        createdAt: new Date("2024-10-25T19:10:22.256Z"),
        updatedAt: new Date("2024-10-25T19:10:22.256Z"),
        __v: 0
    };
    await db.collection('users').insertOne(user);
    await db.collection('products').insertOne(book);
});

test("register user", async ({ page }) => {
	await page.goto("http://localhost:3000/register");
	await page.getByRole("link", { name: "Register" }).click();
	await page.getByPlaceholder("Enter Your Name").fill("testing name");
	await page.getByPlaceholder("Enter Your Email").fill("test@test.com");
	await page.getByPlaceholder("Enter Your Password").fill("test@test.com");
	await page.getByPlaceholder("Enter Your Phone").fill("99999999");
	await page.getByPlaceholder("Enter Your Address").fill("test addresss");
	await page.locator("#exampleInputDOB1").fill("1990-01-01");
	await page.getByPlaceholder("What is Your Favorite sports").fill("running");
	await page.locator(".btn.btn-primary").click();
	//Ensure login is sucessful
	await expect(
		page.getByText("Register Successfully, please login")
	).toBeVisible();
	// Check if the page has navigated to /login
	await expect(page).toHaveURL("http://localhost:3000/login");

    
});

function generateRandomEmail() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let email = '';
    
    // Generate random username
    for (let i = 0; i < 8; i++) {
        email += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    email += '@';
    
    // Generate random domain
    for (let i = 0; i < 5; i++) {
        email += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    email += '.com';
    return email;
}

test.afterEach(async () => {
	await db.collection("users").deleteMany({ email: email });
    await db.collection("products").deleteMany({ name: "best-book" });
});

test.afterAll(async () => {
	await client.close();
});
