import fs from 'fs'

export const CATEGORY_DATA = [
    {
        name: "Shirts",
        slug: "shirts"
    },
    {
        name: "Blouses",
        slug: "blouses"
    }
];

export const PRODUCT_DATA = [
    {
        name: "Checkered Blue Shirt",
        slug: "checkered-blue-shirt",
        description: "A well tailored checkered blue shirt that makes you look smart and tidy",
        price: 20,
        category: "Shirts",  //To be replaced in code later
        quantity: 40,
        photo: {
          data: fs.readFileSync("./data/images/shirts/checkered-blue-shirt.webp"),
          contentType: "image/webp",
        },
        shipping: true,
    }
];