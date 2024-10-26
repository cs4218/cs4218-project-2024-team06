import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import productModel from "../models/productModel";
import {deleteProductController} from "./productController";
import fs from 'fs';

let mongoServer;

describe('Integration of delete product controller', () => {
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

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test.failing('returns 200, success message and deletes product with valid input', async () => {
        
        //fails as original message is buggy (capitalisation)

        //ARRANGE
        const expectedBuffer = fs.readFileSync('client/public/images/test-pdt-gen.jpg');
        const expectedCategory = new mongoose.Types.ObjectId();

        //products in the database
        const pdt1 = await new productModel({
            name: "Sneakers",
            slug: "sneakers",
            description: "Latest version of Adidas sneakers.",
            price: 134,
            quantity: 10,
            category: expectedCategory,  
            photo: {
              data: expectedBuffer,  
              contentType: "image/png"
            },
            shipping: true,
            timestamp:Date.now()})
        .save();
        const pid1 = pdt1._id;

        const pdt2 = await new productModel({
            name: "Order of Phoenix",
            slug: "order-of-phoenix",
            description: "Harry returns for the fifth year at Hogwarts.",
            price: 149,
            quantity: 71,
            category: new mongoose.Types.ObjectId(),  
                photo: {
                    data: expectedBuffer,  
                    contentType: "image/png"
                },
            shipping: true,
            timestamp:Date.now()})
        .save();
        const delPid = pdt2._id;

        req.params = {
            pid: delPid
        };

        //ACT
        await deleteProductController(req, res);

        //ASSERT
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: "Product Deleted Successfully",
            })
        );

        //not deleted
        const samplePdt1 = await productModel.findById(pid1);
        expect(samplePdt1).not.toBeNull();
        expect(samplePdt1.name).toEqual("Sneakers");
        expect(samplePdt1.description).toEqual("Latest version of Adidas sneakers.");
        expect(samplePdt1.quantity).toEqual(10);
        expect(samplePdt1.price).toEqual(134);
        expect(samplePdt1.category).toEqual(expectedCategory);
        expect(samplePdt1.shipping).toEqual(true);
        expect(Buffer.compare(samplePdt1.photo.data, expectedBuffer)).toBe(0);

        //deleted
        const samplePdt2 = await productModel.findById(delPid);
        expect(samplePdt2).toBeNull(); 
        
    });


    });