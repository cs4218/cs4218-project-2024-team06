import { test, expect } from "@playwright/test";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let db;
let client;

test.beforeAll(async () => {
	// @ts-ignore
	client = new MongoClient(process.env.MONGO_URL);
	await client.connect();
	db = client.db("ecommerce-test");
});

let email = generateRandomEmail();

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

test("register user", async ({ page }) => {
	await page.goto("http://localhost:3000/register");
	await page.getByRole("link", { name: "Register" }).click();
	await page.getByPlaceholder("Enter Your Name").fill("testing name");
	await page.getByPlaceholder("Enter Your Email").fill(email);
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

    await page.getByPlaceholder("Enter Your Email").fill(email);
	await page.getByPlaceholder("Enter Your Password").fill("test@test.com");
    await page.locator(".btn.btn-primary").click();
    await expect(
		page.getByText("login successfully")
    ).toBeVisible();
});

test.afterEach(async () => {
	await db.collection("users").deleteMany({ email: email });
});

test.afterAll(async () => {
	await client.close();
});
