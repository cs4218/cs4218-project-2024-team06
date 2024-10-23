import fs from 'fs'

export const FASHION_CATEGORY_DATA = [
    {
        name: "Shirts",
        slug: "shirts"
    },
    {
        name: "Blouses",
        slug: "blouses"
    }
];

export const FASHION_PRODUCT_DATA = [
    {
        name: "Checkered Blue Shirt",
        slug: "checkered-blue-shirt",
        description: "A well tailored checkered blue shirt that makes you look smart and tidy.",
        price: 20.00,
        category: "Shirts",  //To be replaced with category object id in code later
        quantity: 40,
        photo: {
          data: fs.readFileSync("./data/images/shirts/checkered-blue-shirt.webp"),
          contentType: "image/webp",
        },
        shipping: true,
    },
    {
        name: "Striped Blue Shirt",
        slug: "striped-blue-shirt",
        description: "The striped blue shirt is designed by our top designer in the house!",
        price: 80.00,
        category: "Shirts",  //To be replaced with category object id in code later
        quantity: 10,
        photo: {
          data: fs.readFileSync("./data/images/shirts/striped-blue-shirt.jpg"),
          contentType: "image/jpg",
        },
        shipping: true,
    },
    {
        name: "Dotted Blue Shirt",
        slug: "dotted-blue-shirt",
        description: "Dots on a blue shirt! A new combination that is fashionable today.",
        price: 50.00,
        category: "Shirts",  //To be replaced with category object id in code later
        quantity: 100,
        photo: {
          data: fs.readFileSync("./data/images/shirts/dotted-blue-shirt.jpg"),
          contentType: "image/jpg",
        },
        shipping: true,
    },
    {
        name: "Checkered Blue Blouse",
        slug: "checkered-blue-blouse",
        description: "A comfortable yet beautiful piece of blouse that you would want to have.",
        price: 70.00,
        category: "Blouses",  //To be replaced with category object id in code later
        quantity: 20,
        photo: {
          data: fs.readFileSync("./data/images/blouses/checkered-blue-blouses.webp"),
          contentType: "image/webp",
        },
        shipping: true,
    },
    {
        name: "Striped Blue Blouse",
        slug: "striped-blue-blouse",
        description: "This blouse will definitely make you stand out among the crowd.",
        price: 60.00,
        category: "Blouses",  //To be replaced with category object id in code later
        quantity: 30,
        photo: {
          data: fs.readFileSync("./data/images/blouses/striped-blue-blouse.jpg"),
          contentType: "image/jpg",
        },
        shipping: true,
    },
    {
        name: "Dotted Blue Blouse",
        slug: "dotted-blue-blouse",
        description: "A new arrival in our shop, this piece is tailored to every individual who loves a dotted fit.",
        price: 90.00,
        category: "Blouses",  //To be replaced with category object id in code later
        quantity: 80,
        photo: {
          data: fs.readFileSync("./data/images/blouses/dotted-blue-blouse.webp"),
          contentType: "image/webp",
        },
        shipping: true,
    },
];