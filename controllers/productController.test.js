import fs from 'fs';
import slugify from "slugify";
import productModel from "../models/productModel";
import { createProductController, deleteProductController } from "./productController";

jest.mock("../models/productModel");
jest.mock('braintree');
jest.mock("slugify");
jest.mock('fs');

beforeEach(() => {
    process.env.BRAINTREE_MERCHANT_ID = 'test_merchant_id';
    process.env.BRAINTREE_PUBLIC_KEY = 'test_public_key';
    process.env.BRAINTREE_PRIVATE_KEY = 'test_private_key';
});

describe('createProductController', () => {
    let req, res, consoleLogSpy;
    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    test('should return 500 with correct error message if no req body', async () => {
        req.body = {};

        await createProductController(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: expect.any(Error),
            message: 'Error in crearing product'
        });
    });

    test('should return 500 with correct error message if no name in req body', async () => {
        req.fields = {
                description: 'Test Description',
                price: 100,
                category: 'Test Category',
                quantity: 10,
                shipping: true
        };
        req.files = {
                photo: {
                path: 'client/public/images/test-pdt-img-1.jpg', 
                size: 1024 
                }
            };

        await createProductController(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            error: 'Name is Required'
        });
    })

    test('should return 500 with correct error message if no description in req body', async () => {
        req.fields = {
                name: 'Test Name',
                price: 100,
                category: 'Test Category',
                quantity: 10,
                shipping: true
        };
        req.files = {
                photo: {
                path: 'client/public/images/test-pdt-img-1.jpg', 
                size: 1024 
                }
            };

        await createProductController(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            error: 'Description is Required'
        });
    });

    test('should return 500 with correct error message if no price in req body', async () => {
        req.fields = {
                name: 'Test Name',
                description: 'Test Description',
                category: 'Test Category',
                quantity: 10,
                shipping: true
        };
        req.files = {
                photo: {
                path: 'client/public/images/test-pdt-img-1.jpg', 
                size: 1024 
                }
            };

        await createProductController(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            error: 'Price is Required'
        });
    });

    test('should return 500 with correct error message if no quantity in req body', async () => {
        req.fields = {
            name: 'Test Name',
            description: 'Test Description',
            category: 'Test Category',
            price: 100,
            shipping: true
        };
        req.files = {
                photo: {
                path: 'client/public/images/test-pdt-img-1.jpg', 
                size: 1024 
                }
        };

        await createProductController(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            error: 'Quantity is Required'
        });
    });

    test('should return 500 with correct error message if no category in req body', async () => {
        req.fields = {
            name: 'Test Name',
            description: 'Test Description',
            quantity: 10,
            price: 100,
            shipping: true
        };
        req.files = {
                photo: {
                path: 'client/public/images/test-pdt-img-1.jpg', 
                size: 1024 
                }
        };

        await createProductController(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            error: 'Category is Required'
        });
    });

    test('should return 500 with correct error message if no photo in req files', async () => {
        // supposed to fail due to error in original implementation
        req.fields = {
            name: 'Test Name',
            description: 'Test Description',
            category: 'Test Category',
            price: 100,
            quantity: 10,
            shipping: true
        };
        req.files = {};

        await createProductController(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            error: 'photo is Required and should be less then 1mb'
        });
    });

    test('should return 500 with correct error message if photo there but too large', async () => {
        req.fields = {
            name: 'Test Name',
            description: 'Test Description',
            category: 'Test Category',
            price: 100,
            quantity: 10,
            shipping: true
        };
        req.files = {
            photo: {
            path: 'client/public/images/test-pdt-img-1.jpg', 
            size: 1000002 
            }
        };

        await createProductController(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            error: 'photo is Required and should be less then 1mb'
        });
    });

    test('should return 200 and create new product with valid data', async () => {
    req.fields = {
        name: 'Test Name',
        description: 'Test Description',
        price: 100,
        category: 'Test Category',
        quantity: 10,
        shipping: true
    };

    req.files = {
        photo: {
        path: 'client/public/images/test-pdt-img-1.jpg',
        size: 1024,
        type: 'image/jpeg'
        }
    };

    productModel.findOne.mockResolvedValue(null);
    slugify.mockReturnValue('test-slug');

    const mockPhotoBuffer = Buffer.from('mock-photo-data');
    fs.readFileSync = jest.fn().mockReturnValue(mockPhotoBuffer);

    let createdProduct = null;
    productModel.mockImplementation((data) => {
        createdProduct = { 
        ...data,
        photo: { 
            data: mockPhotoBuffer, 
            contentType: req.files.photo.type 
        }};

        return {
        ...createdProduct,
        save: jest.fn().mockResolvedValue(createdProduct)
        };
    });

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Product Created Successfully",
        products: expect.objectContaining({
        name: 'Test Name',
        slug: 'test-slug',
        description: 'Test Description',
        price: 100,
        category: 'Test Category',
        quantity: 10,
        shipping: true,
        photo: expect.objectContaining({
            data: mockPhotoBuffer,
            contentType: 'image/jpeg'
        })
        })
    });
    });

});

describe('deleteProductController', () => {
    let req, res, consoleLogSpy;
    
    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });


    test('should return 500 with invalid id', async () => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        req.params = {pid:"ABCD"}; 
        productModel.findByIdAndDelete = jest.fn().mockReturnValue(null);

        await deleteProductController(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: expect.any(Error),
            message: 'Error while deleting product'
        });
    });

    test('should return 500 with empty id', async () => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        req.params = {pid:''}; 
        productModel.findByIdAndDelete = jest.fn().mockReturnValue(null);

        await deleteProductController(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: expect.any(Error),
            message: 'Error while deleting product'
        });
    });

})



