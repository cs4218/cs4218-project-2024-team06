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
    });

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    afterEach(async () => {
        await productModel.deleteMany();
    })

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
            shipping: false
        };
        req.files = {
            photo: {
                path: 'client/public/images/test-pdt-img-1.jpg',
                size: 1024
            }
        };

        const expectedBuffer = fs.readFileSync('client/public/images/test-pdt-img-1.jpg');

        //products in the database
        const pdt1 = await new productModel({name: "sneakers", slug: "sneakers", description: "adidas sneakers",price: 134, quantity: 10,
            category: pdtCat,  
            photo: {
                data: expectedBuffer,  
                contentType: "image/png"
            },
            shipping: true, timestamp:Date.now()})
        .save();
        const pid1 = pdt1._id;
        
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
                    shipping: false,
                    photo: expect.objectContaining({
                        data: expect.objectContaining(expectedBuffer)
                    })
                })
            })
        );

        //product originally present remains
        const samplePdt1 = await productModel.findById(pid1);
        expect(samplePdt1).not.toBeNull();
        expect(samplePdt1.name).toEqual("sneakers");
        expect(samplePdt1.description).toEqual("adidas sneakers");
        expect(samplePdt1.quantity).toEqual(10);
        expect(samplePdt1.price).toEqual(134);
        expect(samplePdt1.category).toEqual(pdtCat);
        expect(samplePdt1.shipping).toEqual(true);
        expect(Buffer.compare(samplePdt1.photo.data, expectedBuffer)).toBe(0);

        //new product created
        const samplePdt2 = await productModel.findOne({ name: "ballpoint" });
        expect(samplePdt2).not.toBeNull(); 
        expect(samplePdt2.description).toEqual("ballpoint pen");
        expect(samplePdt2.quantity).toEqual(11);
        expect(samplePdt2.price).toEqual(100);
        expect(samplePdt2.category).toEqual(pdtCat);
        expect(samplePdt2.shipping).toEqual(false);
        expect(Buffer.compare(samplePdt2.photo.data, expectedBuffer)).toBe(0);
        
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
        const expectedBuffer = fs.readFileSync('client/public/images/test-pdt-img-1.jpg');

        //products in the database
        const pdt1 = await new productModel({name: "sneakers", slug: "sneakers", description: "adidas sneakers",price: 134, quantity: 10,
            category: pdtCat,  
            photo: {
                data: expectedBuffer,  
                contentType: "image/png"
            },
            shipping: true, timestamp:Date.now()})
        .save();
        const pid1 = pdt1._id;

        //ACT
        await createProductController(req, res);

        //ASSERT

        //product originally present remains
        const samplePdt1 = await productModel.findById(pid1);
        expect(samplePdt1).not.toBeNull();
        expect(samplePdt1.name).toEqual("sneakers");
        expect(samplePdt1.description).toEqual("adidas sneakers");
        expect(samplePdt1.quantity).toEqual(10);
        expect(samplePdt1.price).toEqual(134);
        expect(samplePdt1.category).toEqual(pdtCat);
        expect(samplePdt1.shipping).toEqual(true);
        expect(Buffer.compare(samplePdt1.photo.data, expectedBuffer)).toBe(0);

        //no product created
        const samplePdt2 = await productModel.findOne({ name: "ballpoint" });
        expect(samplePdt2).toBeNull(); 


        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            error: "Price Is Required", 
        });
        
    });


    });