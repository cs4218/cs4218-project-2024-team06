import { test, expect } from '@playwright/test';
import mongoose from "mongoose";
import dotenv from "dotenv";
import productModel from '../models/productModel.js';

dotenv.config();

test.beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL);
    
    const book = new productModel({
        name: 'best-book',
        slug: 'book-slug',
        description: 'this is the best book',
        price: 18,
        category: new mongoose.Types.ObjectId(),
        quantity: 1,
        photo: {
            data: Buffer.from("sample photo data", "utf-8"),
            contentType: "image/jpeg",
        },
        shipping: false,
    });

    const laptop = new productModel({
        name: 'best-laptop',
        slug: 'laptop-slug',
        description: 'this is the best laptop',
        price: 1500,
        category: new mongoose.Types.ObjectId(),
        quantity: 1,
        photo: {
            data: Buffer.from("sample photo data", "utf-8"),
            contentType: "image/jpeg",
        },
        shipping: false,
    });

    await book.save();
    await laptop.save();
});

test.afterAll(async () => {
    await productModel.deleteOne({ slug: 'book-slug' });
    await productModel.deleteOne({ slug: 'laptop-slug' });
    await mongoose.disconnect();
});

test('filter by price', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    await page.getByText('$0 to 19').click();
    await expect(page.getByText('best-book')).toBeVisible();
    await expect(page.getByText('best-laptop')).not.toBeVisible();

    await page.getByText('$100 or more').click();
    await expect(page.getByText('best-laptop')).toBeVisible();
    await expect(page.getByText('best-book')).not.toBeVisible();

    await page.getByText('RESET FILTERS').click();
    await expect(page.getByText('best-book')).toBeVisible();
    await expect(page.getByText('best-laptop')).toBeVisible();
});