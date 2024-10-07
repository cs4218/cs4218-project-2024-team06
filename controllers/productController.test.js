import braintree, { BraintreeGateway } from "braintree";
import orderModel from "../models/orderModel.js";
import {
    braintreeTokenController,
    brainTreePaymentController,
    createProductController,
    deleteProductController,
    updateProductController,
    getProductController,
    getSingleProductController,
    productPhotoController,
    productFiltersController,
    productCountController,
    productListController,
    searchProductController,
    realtedProductController,
    productCategoryController
} from "./productController";
import fs from 'fs';
import slugify from "slugify";
import productModel from "../models/productModel";
import categoryModel from "../models/categoryModel.js";

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
        test.failing('should generate client token and send in response', async () => {
            const gateway = new braintree.BraintreeGateway();
            gateway.clientToken.generate.mockImplementation((_, callback) => {
                callback(null, { clientToken: 'fake-client-token' });
            });

            await braintreeTokenController(req, res);

            expect(res.send).toHaveBeenCalledWith({ clientToken: 'fake-client-token' });
            expect(res.status).toHaveBeenCalledWith(200);
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

        test.failing('should successfully order', async () => {
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


jest.mock("../models/productModel");

describe('getProductController', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(), 
            send: jest.fn(),
        };

        jest.clearAllMocks();
    });

    test('should return all products successfully', async () => {
        const mockProducts = [
            { _id: "1", name: "Product 1", category: { _id: "cat1", name: "Category 1" } },
            { _id: "2", name: "Product 2", category: { _id: "cat2", name: "Category 2" } },
        ];

        productModel.find.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            sort: jest.fn().mockResolvedValue(mockProducts),
        });

        await getProductController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({});
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            counTotal: mockProducts.length,
            message: "ALlProducts ",
            products: mockProducts,
        });
    });

    test.failing('should handle errors gracefully', async () => {
        const mockError = new Error('Database error');

        productModel.find.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            sort: jest.fn().mockRejectedValue(mockError),
        });

        await getProductController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({});
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Error in getting products",
            error: mockError.message,
        });
    });
});



jest.mock('../models/productModel');

describe('GET /products/:slug', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { slug: 'test-product' }, 
            fields: {},
        };
        res = {
            status: jest.fn().mockReturnThis(), 
            send: jest.fn(), 
        };

        jest.clearAllMocks();
    });

    it('should return a single product successfully', async () => {
        const mockProduct = {
            name: 'Test Product',
            price: 100,
            category: { name: 'Test Category' },
            slug: 'test-product',
        };

        productModel.findOne.mockReturnValue({
            select: jest.fn().mockReturnThis(), 
            populate: jest.fn().mockResolvedValue(mockProduct),
        });

        await getSingleProductController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: 'Single Product Fetched',
            product: mockProduct,
        });
    });

    test.failing('should return 500 when an error occurs', async () => {
        const mockError = new Error('Database error');
        
        productModel.findOne.mockReturnValue({
            select: jest.fn().mockReturnThis(), 
            populate: jest.fn().mockRejectedValue(mockError), 
        });

        await getSingleProductController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: 'Error while getitng single product',
            error: mockError.message,
        });
    });
});


jest.mock('../models/productModel');

describe('GET /products/photo/:pid', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { pid: 'test-product-id' }, 
            fields: {}, 
        };
        res = {
            set: jest.fn(), 
            status: jest.fn().mockReturnThis(), 
            send: jest.fn(), 
        };

        jest.clearAllMocks();
    });

    it('should return a product photo successfully', async () => {
        const mockPhoto = {
            photo: { 
                contentType: 'image/jpeg',
                data: Buffer.from('mock image data'), 
            },
        };

        productModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockPhoto), 
        });

        await productPhotoController(req, res);

        expect(res.set).toHaveBeenCalledWith('Content-type', mockPhoto.photo.contentType);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(mockPhoto.photo.data);
    });

    // fail because incorrect spelling
    test.failing('should return 500 when an error occurs', async () => {
        const mockError = new Error('Database error');
        productModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockError), 
        }); 

        await productPhotoController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: 'Error while getting photo',
            error: expect.any(Error), 
        });
    });
});

describe('POST /products/filter', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                checked: [], 
                radio: [], 
            },
        };
        res = {
            status: jest.fn().mockReturnThis(), 
            send: jest.fn(),
        };

        jest.clearAllMocks();
    });

    it('should filter products by category and price', async () => {
        const mockProducts = [{ name: 'Product 1' }, { name: 'Product 2' }];
        req.body.checked = ['Category1', 'Category2']; 
        req.body.radio = [10, 50]; 

        productModel.find.mockResolvedValue(mockProducts);

        await productFiltersController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({
            category: req.body.checked,
            price: { $gte: req.body.radio[0], $lte: req.body.radio[1] },
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            products: mockProducts,
        });
    });

    it('should return 400 when an error occurs', async () => {
        const mockError = new Error('Database error');
        productModel.find.mockRejectedValue(mockError); 

        await productFiltersController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Error WHile Filtering Products",
            error: expect.any(Error), 
        });
    });
});

describe('GET /products/count', () => {
    let req, res;

    beforeEach(() => {
        req = {}; 
        res = {
            status: jest.fn().mockReturnThis(), 
            send: jest.fn(),
        };

        jest.clearAllMocks();
    });

    it('should return the total product count successfully', async () => {
        const mockTotalCount = 50; 

        productModel.find.mockReturnValue({
            estimatedDocumentCount: jest.fn().mockResolvedValue(mockTotalCount),
        });

        await productCountController(req, res);

        expect(productModel.find().estimatedDocumentCount).toHaveBeenCalled(); // Check that the method is called
        expect(res.status).toHaveBeenCalledWith(200); // Check the response status
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            total: mockTotalCount, // Check that the total is correct
        });
    });

    // it('should return 400 when an error occurs', async () => {
    //     const mockError = new Error('Database error'); 
    //     productModel.find.mockReturnValue({
    //         estimatedDocumentCount: jest.fn().mockRejectedValue(mockError), 
    //     });

    //     await productCountController(req, res);

    //     expect(res.status).toHaveBeenCalledWith(400); 
    //     expect(res.send).toHaveBeenCalledWith({
    //         message: "Error in product count", 
    //         error: mockError,
    //         success: false,
    //     });
    // });
});

describe('GET /products/page/:page', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { page: '1' }, 
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(), 
        };

        jest.clearAllMocks();
    });

    it('should return a list of products successfully', async () => {
        const mockProducts = [
            { name: 'Product 1', price: 100 },
            { name: 'Product 2', price: 150 },
        ];

        
        productModel.find.mockReturnValue({
            select: jest.fn().mockReturnThis(), 
            skip: jest.fn().mockReturnThis(), 
            limit: jest.fn().mockReturnThis(),
            sort: jest.fn().mockResolvedValue(mockProducts), 
        });

        await productListController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({}); 
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            products: mockProducts, 
        });
    });

    // it('should handle errors correctly', async () => {
    //     const mockError = new Error('Database error'); 
    //     productModel.find.mockReturnValue({
    //         select: jest.fn().mockReturnThis(), 
    //         skip: jest.fn().mockReturnThis(), 
    //         limit: jest.fn().mockReturnThis(), 
    //         sort: jest.fn().mockRejectedValue(mockError), 
    //     });

    //     await productListController(req, res);

    //     expect(res.status).toHaveBeenCalledWith(400); 
    //     expect(res.send).toHaveBeenCalledWith({
    //         success: false,
    //         message: "error in per page ctrl",
    //         error: mockError,
    //     });
    // });
});

describe('GET /products/search/:keyword', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { keyword: 'test' }, 
        };
        res = {
            json: jest.fn().mockReturnThis(), 
            status: jest.fn().mockReturnThis(), 
            send: jest.fn(),
        };

        jest.clearAllMocks();
    });

    it('should return a list of products that match the search keyword', async () => {
        const mockProducts = [
            { name: 'Test Product 1', description: 'This is a test product.' },
            { name: 'Another Test Product', description: 'Another product for testing.' },
        ];

        
        productModel.find.mockResolvedValue(mockProducts); 

        await searchProductController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({
            $or: [
                { name: { $regex: req.params.keyword, $options: 'i' } },
                { description: { $regex: req.params.keyword, $options: 'i' } },
            ],
        });
    });

    // it('should handle errors correctly', async () => {
    //     const mockError = new Error('Database error'); 
    //     productModel.find.mockResolvedValue(mockError); 

    //     await searchProductController(req, res);

    //     expect(res.status).toHaveBeenCalledWith(400); 
    //     expect(res.send).toHaveBeenCalledWith({
    //         success: false,
    //         message: 'Error In Search Product API', 
    //         error: expect.any(Error), 
    //     });
    // });
});


describe('GET /products/realted/:pid/:cid', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { 
                pid: 'test-product-id', 
                cid: 'test-category-id'  
            },
        };
        res = {
            status: jest.fn().mockReturnThis(), 
            send: jest.fn(), 
        };

        jest.clearAllMocks();
    });


    it('should handle errors correctly', async () => {
        const mockError = new Error('Database error'); 
        productModel.find.mockResolvedValue(mockError); 

        await realtedProductController(req, res);

        expect(res.status).toHaveBeenCalledWith(400); 
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: 'error while geting related product', 
            error: expect.any(Error), 
        });
    });
});

jest.mock('../models/categoryModel');

describe('GET /products/category/:slug', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { slug: 'test-category-slug' }, 
        };
        res = {
            status: jest.fn().mockReturnThis(), 
            send: jest.fn(), 
        };

        jest.clearAllMocks();
    });

    it('should handle errors correctly', async () => {
        const mockError = new Error('Database error'); 
        categoryModel.findOne.mockRejectedValue(mockError); 

        await productCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(400); 
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: mockError, 
            message: "Error While Getting products", 
        });
    });
});
