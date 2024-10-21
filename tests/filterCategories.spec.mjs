import { test, expect } from '@playwright/test';
import mongoose from "mongoose";
import dotenv from "dotenv";
import categoryModel from '../models/categoryModel.js';
import productModel from '../models/productModel.js';

dotenv.config();

test.beforeAll(async () => {
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

    const bookCategory = new categoryModel({
        name: 'books-category',
        slug: 'books-category-slug',
        _id: '64b0c0f9a4b1a33d8e4a0d0e',
    });

    const electronicsCategory = new categoryModel({
        name: 'electronics-category',
        slug: 'electronics-category-slug',
        _id: '74b0c0f9a4b1a33d8e4a0d0e',
    });

    await book.save();
    await laptop.save();
    await bookCategory.save();
    await electronicsCategory.save();
});

test.afterAll(async () => {
    await productModel.deleteOne({ slug: 'book-slug' });
    await productModel.deleteOne({ slug: 'laptop-slug' });
    await categoryModel.deleteOne({ slug: 'books-category-slug' });
    await categoryModel.deleteOne({ slug: 'electronics-category-slug' });
    await mongoose.disconnect();
});

test('filter by categories', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    // Click book category
    await page.getByRole('main').getByText('books-category').click();
    await expect(page.getByText('best-book')).toBeVisible();
    await expect(page.getByText('best-laptop')).not.toBeVisible();

    // Remove book category and select electronics 
    await page.getByRole('main').getByText('books-category').click();
    await page.getByRole('main').getByText('electronics-category').click();
    await expect(page.getByText('best-laptop')).toBeVisible();
    await expect(page.getByText('best-book')).not.toBeVisible();

    // Select book category 
    await page.getByRole('main').getByText('books-category').click();
    await expect(page.getByText('best-laptop')).toBeVisible();
    await expect(page.getByText('best-book')).toBeVisible();

    await page.getByText('RESET FILTERS').click();
    await expect(page.getByText('best-laptop')).toBeVisible();
    await expect(page.getByText('best-book')).toBeVisible();
});
