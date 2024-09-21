import braintree, { BraintreeGateway } from "braintree";
import orderModel from "../models/orderModel.js";
import {
    braintreeTokenController,
    brainTreePaymentController
} from "./productController";

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
    });

    // NEVER PASS
    describe('braintreeTokenController', () => {
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

        test('should handle error when perfoming transaction sale', async () => {
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

            await braintreeTokenController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(consoleLogSpy).toHaveBeenCalledWith(error);
        });
    });
});
