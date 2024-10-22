import { test, expect } from '@playwright/test';
import dotenv from "dotenv";
import productModel from '../models/productModel';
import mongoose from 'mongoose';

dotenv.config();

test.beforeAll( async () => {
    await mongoose.connect(process.env.MONGO_URL);

    const book = new productModel({
        name: 'best-book',
        slug: 'book-slug',
        description: 'this is the best book',
        price: 18,
        category: new mongoose.Types.ObjectId('64b0c0f9a4b1a33d8e4a0d0e'),
        quantity: 1,
        photo: {
            data: Buffer.from('sample photo data', 'utf-8'),
            contentType: 'image/jpeg',
        },
        shipping: false,
    });

    const laptop = new productModel({
        name: 'best-laptop',
        slug: 'laptop-slug',
        description: 'this is the best laptop',
        price: 1500,
        category: new mongoose.Types.ObjectId('74b0c0f9a4b1a33d8e4a0d0e'),
        quantity: 1,
        photo: {
            data: Buffer.from('sample photo data', 'utf-8'),
            contentType: 'image/jpeg',
        },
        shipping: false,
    });

    await book.save();
    await laptop.save();
});

test.afterAll( async () => {
    await productModel.deleteOne({ slug: 'book-slug' });
    await productModel.deleteOne({ slug: 'laptop-slug' });
    mongoose.disconnect();
});

test('add to cart and checkout', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    await page.getByText('ADD TO CART').first().click();
    await page.getByText('ADD TO CART').nth(1).click();

    await page.getByRole('link', { name: 'Cart' }).click();
    await expect(page).toHaveURL('http://localhost:3000/cart');
    await expect(page.getByText('best-book')).toBeVisible();
    await expect(page.getByText('best-book')).toBeVisible();
    await expect(page.getByText('You Have 2 items in your cart please login to checkout')).toBeVisible();
    await expect(page.getByText('Total : $1,518.00')).toBeVisible();

    await page.getByText('REMOVE').first().click();
    await expect(page.getByText('You Have 1 items in your cart please login to checkout')).toBeVisible();
    await expect(page.getByText('Total : $18.00')).toBeVisible();

    await page.getByText('REMOVE').first().click();
    await expect(page.getByText('Your cart is empty')).toBeVisible();
    await expect(page.getByText('Total : $0.00')).toBeVisible();
});
