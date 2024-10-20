import { test, expect } from '@playwright/test';
import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";
import mongoose from "mongoose";
import { FASHION_CATEGORY_DATA, FASHION_PRODUCT_DATA } from "../data/index.js";

/**
This UI test aims to test the E2E flow of a user searching a product using the search bar, viewing information about
the product that is found and adding it to cart, just like the consumer pattern of window shopping.

1. User enters a search term in the search bar.
2. User views more details about a result from the search.
3. User decides to add the result to his cart after viewing details.
*/

//Variables for setting up mongodb collections
const CATEGORIES_COLLECTION = "categories"
const PRODUCTS_COLLECTION = "products"


//VariableS for keeping track of products
const FASHION_CATEGORY_IDS = {};
let numberOfShirtProducts = 0;
let numberOfBlouseProducts = 0;
let firstShirtProduct;


test.beforeEach(async () => {
    //Connect to the database
    await mongoose.connect(process.env.MONGO_URL);

    //Create the collections
    await mongoose.connection.createCollection(CATEGORIES_COLLECTION);
    await mongoose.connection.createCollection(PRODUCTS_COLLECTION);

    //Create categories to work with
    for (const categoryData of FASHION_CATEGORY_DATA) {
        const category = new categoryModel(categoryData);
        const savedCategory = await category.save();

        FASHION_CATEGORY_IDS[categoryData.name] = savedCategory._id;
    }

    //Create products to work with
    for (const productData of FASHION_PRODUCT_DATA) {
        if (productData['category'] == "Shirts") {
            numberOfShirtProducts += 1;
            if (firstShirtProduct == undefined) {
                //Track the first shirt product that was created, as we need it in the test later on
                firstShirtProduct = { ...productData }
            }
        } else if (productData['category'] == "Blouses") {
            numberOfBlouseProducts += 1;
        }
        productData['category'] = FASHION_CATEGORY_IDS[productData['category']];
        const product = new productModel(productData);
        await product.save();
    }
});


test.afterEach(async () => {
    //Reset the collections
    await mongoose.connection.collection(CATEGORIES_COLLECTION).deleteMany({});
    await mongoose.connection.collection(PRODUCTS_COLLECTION).deleteMany({});

    //Disconnect from the database
    await mongoose.disconnect();
});


test.describe('User should be able to search products using the search bar and view details about the search results', () => {

    //NEVER PASS
    //THE MORE DETAILS BUTTON IN PRODUCTS FOUND IN SEARCH RESULTS APPEARS TO BE BROKEN
    test.fail('by entering a search keyword', async ({ page }) => {
        //Give more time to run as there are 3 browsers for a test
        test.slow();


        //Visit website
        await page.goto('http://localhost:3000/');


        //Verify that all products are initially displayed
        let numberOfProductsDisplayed = 0;
        for (const productData of FASHION_PRODUCT_DATA) {
            await expect(page.getByRole('heading', { name: productData.name })).toBeVisible();
            numberOfProductsDisplayed += 1;
        }
        expect(numberOfProductsDisplayed).toBe(FASHION_PRODUCT_DATA.length);


        // Search in the search bar
        await page.getByPlaceholder('Search').click();
        await page.getByPlaceholder('Search').fill('Shirt');
        await page.getByRole('button', { name: 'Search' }).click();


        //Check that the number of search results for 'Shirt' is correct according to input data
        await expect(page.getByRole('heading', { name: 'Found' })).toHaveText('Found ' + numberOfShirtProducts.toString());


        //Click to view details about the first shirt product
        let firstMoreDetailsButton = page.getByRole('heading', { name: firstShirtProduct.name }).locator('..').locator('button', { hasText: 'More Details' });
        await firstMoreDetailsButton.click();


        //Expect to view product details of the first shirt product
        await expect(page.getByRole('heading', { name: 'Name : ' + firstShirtProduct.name })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Description : ' + firstShirtProduct.description })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Price : $' + firstShirtProduct.price })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Category : ' + firstShirtProduct.category })).toBeVisible();


        //Expect to view other shirts as similar products
        const similarProductsHeading = page.getByRole('heading', { name: 'Similar Products ➡️' });
        const similarProductsContainer = similarProductsHeading.locator('xpath=following-sibling::div[1]');
        await similarProductsContainer.waitFor({ state: 'visible' });
        const numberOfSimilarProducts = await similarProductsContainer.locator('.card').count();
        expect(numberOfSimilarProducts).toBe(numberOfShirtProducts - 1); // Excluding the current selected product
 

        //Expect to be able to add the first shirt product to cart
        await (page.getByRole('button', { name: 'ADD TO CART' })).click();
        await expect(page.getByText('Item Added to cart')).toBeVisible();
    });
});
