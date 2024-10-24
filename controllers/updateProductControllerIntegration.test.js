import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import productModel from "../models/productModel";
import {updateProductController} from "./productController";
import fs from 'fs';

let mongoServer;

describe('integration of update product controller', () => {
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

    test('returns 200, success message and updates product with valid input', async () => {
        
        //fails as we expect 200 not 201

        //ARRANGE
        const pdtCat = new mongoose.Types.ObjectId();
        const updatedCat = new mongoose.Types.ObjectId();
        
        req.fields = {
            name: "updated timeless", //change
            description: "updated version of timeless book", //change
            price: 73, //change
            category: updatedCat, //change
            quantity: 11, //same
            shipping: false //same
        };
        req.files = {
            photo: { //same
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

        const pdt2 = await new productModel({name: "timeless", slug: "timeless", description: "book called timeless",price: 149, quantity: 71,
            category: new mongoose.Types.ObjectId(),  
                photo: {
                    data: expectedBuffer,  
                    contentType: "image/png"
                },
            shipping: true, timestamp:Date.now()})
        .save();
        const updatePid = pdt2._id;

        req.params = {pid: updatePid};
        
        //ACT
        await updateProductController(req, res);

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

        //updated product 
        const samplePdt2 = await productModel.findById(updatePid);
        expect(samplePdt2).not.toBeNull(); 
        expect(samplePdt2.name).toEqual("updated timeless");
        expect(samplePdt2.description).toEqual("updated version of timeless book");
        expect(samplePdt2.quantity).toEqual(11);
        expect(samplePdt2.price).toEqual(73);
        expect(samplePdt2.category).toEqual(updatedCat);
        expect(samplePdt2.shipping).toEqual(false);
        expect(Buffer.compare(samplePdt2.photo.data, expectedBuffer)).toBe(0);
        
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: "Product Updated Successfully",
            products: expect.objectContaining({
                    name: "updated timeless",
                    description: "updated version of timeless book",
                    slug: "updated-timeless",
                    price: 73,
                    category: updatedCat, 
                    quantity: 11, //same
                    shipping: false, //same
                    photo: expect.objectContaining({ //same
                        data: expect.objectContaining(expectedBuffer)
                    })
                })
            })
        );
    });


    });