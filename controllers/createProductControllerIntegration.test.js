import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import productModel from "../models/productModel";
import {createProductController} from "./productController";
import fs from 'fs';

let mongoServer;

describe('integration of create product controller', () => {
    let req, res;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);

        //products in the database (empty buffer and category mock for testing)
        await new productModel({name: "sneakers", slug: "sneakers", description: "adidas sneakers",price: 134, quantity: 10,
            category: new mongoose.Types.ObjectId(),  
            photo: {
              data: Buffer.from(""),  
              contentType: "image/png"
            },
            shipping: true, timestamp:Date.now()})
        .save();
        
        await new productModel({name: "aqua", slug: "aqua", description: "aqua dresses",price: 14, quantity: 1,
            category: new mongoose.Types.ObjectId(),  
                photo: {
                  data: Buffer.from(""),  
                  contentType: "image/png"
                },
            shipping: false, timestamp:Date.now()})
        .save();

        await new productModel({name: "timeless", slug: "timeless", description: "book called timeless",price: 149, quantity: 71,
            category: new mongoose.Types.ObjectId(),  
                photo: {
                    data: Buffer.from(""),  
                    contentType: "image/png"
                },
            shipping: true, timestamp:Date.now()})
        .save();
    });

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test.failing('returns 200, success message and creates product with valid input', async () => {
        
        //fails as we expect 200 not 201
        
        //ARRANGE
        const pdtCat = new mongoose.Types.ObjectId();
        req.fields = {
            name: "ballpoint",
            description: 'ballpoint pen',
            price: 100,
            category: pdtCat,
            quantity: 11,
            shipping: true
        };
        req.files = {
            photo: {
                path: 'client/public/images/test-pdt-img-1.jpg',
                size: 1024
            }
        };

        const expectedBuffer = fs.readFileSync('client/public/images/test-pdt-img-1.jpg');

        //ACT
        await createProductController(req, res);

        //ASSERT
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: "Product Created Successfully",
            products: expect.objectContaining({
                    name: "ballpoint",
                    description: "ballpoint pen",
                    slug: "ballpoint",
                    price: 100,
                    category: pdtCat, 
                    quantity: 11,
                    shipping: true,
                    photo: expect.objectContaining({
                        data: expect.objectContaining(expectedBuffer)
                    })
                })
            })
        );
        
    });

    test.failing('returns 500 and error with missing price', async () => {

        //fails as original message is buggy (capitalisation)

        //ARRANGE
        const pdtCat = new mongoose.Types.ObjectId();
        
        req.fields = {
            name: "ballpoint",
            description: "some ballpoint pen",
            category: pdtCat,
            quantity: 11,
            shipping: true
        };
        req.files = {
            photo: {
                path: 'client/public/images/test-pdt-img-1.jpg',
                size: 1024
            }
        };

        //ACT
        await createProductController(req, res);

        //ASSERT
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            error: "Price Is Required", 
        });
        
    });


    });