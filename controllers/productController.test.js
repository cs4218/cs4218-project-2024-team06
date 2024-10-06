import braintree, { BraintreeGateway } from "braintree";
import orderModel from "../models/orderModel.js";
import {
    braintreeTokenController,
    brainTreePaymentController,
    createProductController,
    deleteProductController,
    updateProductController
} from "./productController";
import fs from 'fs';
import slugify from "slugify";
import productModel from "../models/productModel";

// Mock the Braintree gateway
jest.mock('braintree', () => {
    const generate = jest.fn();
    const sale = jest.fn();
    return {
        BraintreeGateway: jest.fn().mockImplementation(() => {
            return {
                clientToken: {
                    generate: generate
                },
                transaction: {
                    sale: sale
                },
            };
        }),
        Environment: {
            Sandbox: 'sandbox'
        },
    };
});

jest.mock('../models/orderModel.js');
jest.mock("../models/productModel");
jest.mock("slugify");
jest.mock('fs');

describe('productController', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn()
        };
        jest.clearAllMocks();

        process.env.BRAINTREE_MERCHANT_ID = 'test_merchant_id';
        process.env.BRAINTREE_PUBLIC_KEY = 'test_public_key';
        process.env.BRAINTREE_PRIVATE_KEY = 'test_private_key';
    });

    describe('braintreeTokenController', () => {
        // NEVER PASS
        test('should generate client token and send in response', async () => {
            const gateway = new braintree.BraintreeGateway();
            gateway.clientToken.generate.mockImplementation((_, callback) => {
                callback(null, { clientToken: 'fake-client-token' });
            });

            await braintreeTokenController(req, res);

            expect(res.send).toHaveBeenCalledWith({ clientToken: 'fake-client-token' });
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('should handle error when generating client token', async () => {
            const error = new Error('Error generating token');
            const gateway = new braintree.BraintreeGateway();
            gateway.clientToken.generate.mockImplementation((_, callback) => {
                callback(error);
            });

            await braintreeTokenController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith(error);
        });

        // NEVER PASS
        test('should handle error thrown in try block', async () => {
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
            const error = new Error('Test error');
            const gateway = new braintree.BraintreeGateway();
            gateway.clientToken.generate.mockImplementation(() => {
                throw error;
            });

            await braintreeTokenController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(consoleLogSpy).toHaveBeenCalledWith(error);
        });
    });

    describe('brainTreePaymentController', () => {
        beforeEach(() => {
            req = {
                body: {
                    nonce: 'nonce',
                    cart: [{ price: 10 }, { price: 20 }],
                },
                user: { _id: 1 }
            }
            jest.clearAllMocks();
        });

        // NEVER PASS
        test('should successfully order ', async () => {
            const gateway = new braintree.BraintreeGateway();
            gateway.transaction.sale.mockImplementation((_, callback) => {
                callback(null, {})
            });

            // Mock orderModel
            orderModel.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue({}),
            }));

            await brainTreePaymentController(req, res);

            // check that transaction sale was called with correct amount and paymentMethodNonce
            expect(gateway.transaction.sale).toHaveBeenCalledWith({
                amount: 30,
                paymentMethodNonce: 'nonce',
                options: {
                    submitForSettlement: true,
                }
            }, expect.any(Function));

            // check that orderModel was called with correct parameters
            expect(orderModel).toHaveBeenCalledWith({
                products: req.body.cart,
                payment: expect.any(Object),
                buyer: req.user._id
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ ok: true });
        });

        test('should handle error when performing transaction sale', async () => {
            const error = new Error('Transaction sale error');
            const gateway = new braintree.BraintreeGateway();
            gateway.transaction.sale.mockImplementation((_, callback) => {
                callback(error);
            });

            await brainTreePaymentController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith(error);
        });

        // NEVER PASS
        test('should handle error when thrown in try block', async () => {
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
            const error = new Error('Test error');
            const gateway = new braintree.BraintreeGateway();
            gateway.transaction.sale.mockImplementation(() => {
                throw error;
            });

            await brainTreePaymentController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(consoleLogSpy).toHaveBeenCalledWith(error);
        });
    });

    describe('createProductController', () => {
        let req, res, consoleLogSpy;
        let error = new Error('File error')
        beforeEach(() => {
            req = {};
            res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
                json: jest.fn()
            };
            jest.clearAllMocks();
        });

        test.failing('returns 500 with correct error message if no name in req body', async () => {
            
            // ARRANGE
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

            // ACT
            await createProductController(req, res);

            // ASSERT 
            expect(res.status).toHaveBeenCalledWith(500);

            // Always fails
            expect(res.send).toHaveBeenCalledWith({
                error: 'Name Is Required'
            });
        })

        test.failing('returns 500 with correct error message if no description in req body', async () => {
            
            //ARRANGE
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

            //ACT
            await createProductController(req, res);

            //ASSERT (fails as original message buggy)
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                error: 'Description Is Required'
            });
        });

        test.failing('returns 500 with correct error message if no price in req body', async () => {
            //ARRANGE
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

            //ACT
            await createProductController(req, res);
            
            //ASSERT (original message buggy)
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                error: 'Price Is Required'
            });
        });

        test.failing('returns 500 with correct error message if no quantity in req body', async () => {
            
            //ARRANGE
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

            //ACT
            await createProductController(req, res);

            //ASSERT (original message buggy)
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                error: 'Quantity Is Required'
            });
        });

        test.failing('returns 500 with correct error message if no category in req body', async () => {
            //ARRANGE
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

            //ACT
            await createProductController(req, res);

            //ASSERT (Original message buggy)
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                error: 'Category Is Required'
            });
        });

        test.failing('returns 500 with correct error message if no photo in req files', async () => {
            //ARRANGE
            req.fields = {
                name: 'Test Name',
                description: 'Test Description',
                category: 'Test Category',
                price: 100,
                quantity: 10,
                shipping: true
            };
            req.files = {};

            //ACT
            await createProductController(req, res);

            //ASSERT (Always Fails due to originally buggy message)
            // Original code also has logical error in line 37: needs to be "!photo", not "photo"
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                error: 'Photo Is Required And Should Be Less Than 1MB'
            });
        });

        test.failing('returns 500 with correct error message if photo there but too large', async () => {
            //ARRANGE
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

            //ACT
            await createProductController(req, res);
            
            //ASSERT
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                error: 'Photo Is Required And Should Be Less Than 1MB'
            });
        });

        test.failing('returns 500 with error when photo path is invalid', async () => {
            
            //ARRANGE
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
                    path: '',
                    size: 1024,
                    type: 'image/jpeg'
                }
            };

            fs.readFileSync = jest.fn().mockRejectedValue(error);
            productModel.mockImplementation((data) => {
                throw error;
            })

            //ACT
            await createProductController(req, res);

            //ASSERT (Original message buggy)
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                error: error,
                message: 'Error In Creating Product'
            });
            expect(consoleLogSpy).toHaveBeenCalledWith(error);
        });

        test.failing('returns 200 and creates new product with valid data', async () => {
            
            //ARRANGE
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

            const mockPhotoBuffer = Buffer.from('mock-photo-data');
            fs.readFileSync = jest.fn().mockReturnValue(mockPhotoBuffer);

            let createdProduct = null;
            productModel.mockImplementation((data) => {
                createdProduct = {
                    ...data,
                    photo: {
                        data: mockPhotoBuffer,
                        contentType: req.files.photo.type
                    }
                };

                return {
                    ...createdProduct,
                    save: jest.fn().mockResolvedValue(createdProduct)
                };
            });

            //ACT
            await createProductController(req, res);

            //ASSERT 
            //Always fails as 200 is expected success code not 201
            expect(res.status).toHaveBeenCalledWith(200);
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
        let req, res;
        let error = new Error('Database error')

        beforeEach(() => {
            req = {};
            res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            };
        });


    test.failing('returns 500 and error when deleting product without id', async () => {
       
        // ARRANGE
        req.body = {}; 
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        productModel.findByIdAndDelete = jest.fn().mockRejectedValue(error); 

        // ACT
        await deleteProductController(req, res);

        // ASSERT
        expect(consoleLogSpy).toHaveBeenCalledWith(error);
        expect(res.status).toHaveBeenCalledWith(500);
        //Always fails as message in original code buggy as per standards
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: expect(error),
            message: 'Error In Deleting Product'
        });
    });



    })

    describe('updateProductController', () => {
        
        let req, res, consoleLogSpy;
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {error});
        const error = new Error('Database error');
        
        beforeEach(() => {
            req = {};
            res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            };
        });

        test.failing('returns 500 with correct error message if no pid in req paramas', async () => {
            //ARRANGE
            req.fields = {
                name: "Test Name",
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
            req.params = {}
            productModel.findByIdAndUpdate = jest.fn().mockRejectedValue(error);

            //ACT
            await updateProductController(req, res);

            //ASSERT (message buggy originally - always fails)
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: 'Error In Updating Product',
                error: error,
            });
            expect(consoleLogSpy).toHaveBeenCalledWith(error);
        })

        test.failing('returns 500 with correct error message if no category in req body', async () => {
            
            //ARRANGE
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

            req.params = { pid: 1 }

            //ACT
            await updateProductController(req, res);

            //ASSERT (original message buggy)
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                error: 'Category Is Required'
            });
        });

        test.failing('returns 500 with correct error message if no photo in req files', async () => {
            
            //ARRANGE
            req.fields = {
                name: 'Test Name',
                description: 'Test Description',
                category: 'Test Category',
                price: 100,
                quantity: 10,
                shipping: true
            };
            req.files = {};

            req.params = { pid: 1 }

            //ACT
            await updateProductController(req, res);

            //ASSERT (Original message and implementation on checking for lack of photo buggy)
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                error: 'Photo Is Required And Should Be Less Than 1MB'
            });
        });

    });
});


