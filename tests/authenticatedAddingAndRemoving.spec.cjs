import { test, expect } from "@playwright/test";
const { MongoClient, ObjectId } = require("mongodb");
import dotenv from "dotenv";

dotenv.config();

let db;
let client;

let email = generateRandomEmail();
const productName = generateRandomProductName();
const productName2 = generateRandomProductName();


test.beforeAll(async () => {
	// @ts-ignore
	client = new MongoClient(process.env.MONGO_URL);
	await client.connect();
	db = client.db("ecommerce-test");

	const book = {
		name: productName,
		slug: productName,
		description: "this is the best book",
		price: 18,
		// @ts-ignore
		category: new ObjectId(), // MongoDB ObjectId
		quantity: 1,
		photo: {
			data: Buffer.from("sample photo data", "utf-8"),
			contentType: "image/jpeg",
		},
		shipping: false,
	};

	const book2 = {
		name: productName2,
		slug: productName2,
		description: "this is the best book2",
		price: 19,
		// @ts-ignore
		category: new ObjectId(), 
		quantity: 1,
		photo: {
			data: Buffer.from("sample photo data", "utf-8"),
			contentType: "image/jpeg",
		},
		shipping: false,
	};

	const user = {
		_id: new ObjectId(),
		name: "testing name",
		email: email,
		password: "$2b$10$GGzM2c9LwEUxio8qHHnd9ev9g9rsAG8m1XYKEkvX9EZeAPgxFWfTC",
		phone: "99999999",
		address: "test addresss",
		answer: "running",
		role: 0,
		createdAt: new Date("2024-10-25T19:10:22.256Z"),
		updatedAt: new Date("2024-10-25T19:10:22.256Z"),
		__v: 0,
	};
	await db.collection("users").insertOne(user);
	await db.collection("products").insertOne(book);
	await db.collection("products").insertOne(book2);
});

test("Adding to cart", async ({ page }) => {
	await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "LOGIN" }).click();

    //entering details to log in
	await page.getByPlaceholder("Enter Your Email").fill(email);
	await page.getByPlaceholder("Enter Your Password").fill("test@test.com");
	await page.locator(".btn.btn-primary").click();
	await expect(page.getByText("login successfully")).toBeVisible();

    //add 2 items to cart
    const productTitleLocator = page.getByText(productName);
	const parentLocator = productTitleLocator.locator('..').locator('..');
	const firstButton = parentLocator.locator('div > button').filter({hasText: 'ADD TO CART'});
	await expect(firstButton).toBeVisible();
	await firstButton.click();

	const productTitleLocator2 = page.getByText(productName2);
	const parentLocator2 = productTitleLocator2.locator('..').locator('..');
	const secondButton = parentLocator2.locator('div > button').filter({hasText: 'ADD TO CART'});
	await expect(secondButton).toBeVisible();
	await secondButton.click();

	await expect(page.getByText("Item Added To cart").first()).toBeVisible();

	//go to cart page
	await page.getByRole("link", { name: "CART" }).click();

    //ensure correct rendering of items in cart
	await expect(page.getByText(productName, { exact: true })).toBeVisible();
	await expect(page.getByText(productName2, { exact: true })).toBeVisible();
	await expect(
		page.getByText("this is the best book", { exact: true })
	).toBeVisible();
	await expect(
		page.getByText("this is the best book2", { exact: true })
	).toBeVisible();
	await expect(page.getByText("price : 18")).toBeVisible();
	await expect(page.getByText("price : 19")).toBeVisible();


    const productTitleLocator3 = page.getByText(productName);
	const parentLocator3 = productTitleLocator3.locator('..').locator('..');
	const removeButton = parentLocator3.locator('div > button').filter({hasText: 'Remove'});
	await expect(removeButton).toBeVisible();
	await removeButton.click();

    //ensure correct rendering of items in cart
	await expect(page.getByText(productName2, { exact: true })).toBeVisible();
	await expect(
		page.getByText("this is the best book2", { exact: true })
	).toBeVisible();
	await expect(page.getByText("price : 19")).toBeVisible();

    //log out
    await page.getByRole("button", { name: "TESTING NAME" }).click();
    await page.getByRole("link", { name: "LOGOUT" }).click();

    //entering details to log in
	await page.getByPlaceholder("Enter Your Email").fill(email);
	await page.getByPlaceholder("Enter Your Password").fill("test@test.com");
	await page.locator(".btn.btn-primary").click();
	await expect(page.getByText("login successfully")).toBeVisible();

    await page.waitForTimeout(1000);
    await page.waitForLoadState();
    //go to cart page
	await page.getByRole("link", { name: "CART" }).click();
	
    //ensure correct rendering of items in cart
	await expect(page.getByText(productName2, { exact: true })).toBeVisible();
	await expect(
		page.getByText("this is the best book2", { exact: true })
	).toBeVisible();
	await expect(page.getByText("price : 19")).toBeVisible();
});

function generateRandomProductName() {
    const randomString = Math.random().toString(36).substring(2, 8); // Generates a 6-character random string
    return `best-book-${randomString}`;
}

function generateRandomEmail() {
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
	let email = "";

	// Generate random username
	for (let i = 0; i < 8; i++) {
		email += chars.charAt(Math.floor(Math.random() * chars.length));
	}

	email += "@";

	// Generate random domain
	for (let i = 0; i < 5; i++) {
		email += chars.charAt(Math.floor(Math.random() * chars.length));
	}

	email += ".com";
	return email;
}

test.afterAll(async () => {
    await db.collection("users").deleteMany({ email: email });
	await db.collection("products").deleteMany({ name: productName });
	await db.collection("products").deleteMany({ name: productName2 });
    await client.close();
});
