import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import productModel from "../models/productModel";
import {deleteProductController} from "./productController";
import fs from 'fs';

let mongoServer;

describe('integration of delete product controller', () => {
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

        const expectedBuffer = fs.readFileSync('client/public/images/test-pdt-img-1.jpg');
        const expectedCategory = new mongoose.Types.ObjectId();

        //products in the database (empty buffer and category mock for testing)
        const pdt1 = await new productModel({name: "sneakers", slug: "sneakers", description: "adidas sneakers",price: 134, quantity: 10,
            category: expectedCategory,  
            photo: {
              data: expectedBuffer,  
              contentType: "image/png"
            },
            shipping: true, timestamp:Date.now()})
        .save();
        const pid1 = pdt1._id;

        const pdt2 = await new productModel({name: "timeless", slug: "timeless", description: "book called timeless",price: 149, quantity: 71,
            category: new mongoose.Types.ObjectId(),  
                photo: {
                    data: expectedBuffer,  
                    contentType: "image/png"
                },
            shipping: true, timestamp:Date.now()})
        .save();
        const delPid = pdt2._id;

        //ARRANGE
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
        const foundPdt1 = await productModel.findById(pid1);
        expect(foundPdt1).not.toBeNull();
        expect(foundPdt1.name).toEqual("sneakers");
        expect(foundPdt1.description).toEqual("adidas sneakers");
        expect(foundPdt1.quantity).toEqual(10);
        expect(foundPdt1.price).toEqual(134);
        expect(foundPdt1.category).toEqual(expectedCategory);
        expect(foundPdt1.shipping).toEqual(true);
        expect(Buffer.compare(foundPdt1.photo.data, expectedBuffer)).toBe(0);

        //deleted
        const foundPdt2 = await productModel.findById(delPid);
        expect(foundPdt2).toBeNull(); 
        
    });


    });