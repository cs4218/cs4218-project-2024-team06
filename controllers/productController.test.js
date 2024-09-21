import braintree from "braintree";
import {
    braintreeTokenController,
    brainTreePaymentController
} from "./productController";

// Mock the Braintree gateway
jest.mock('braintree', () => {
    const generate = jest.fn();
    return {
        BraintreeGateway: jest.fn().mockImplementation(() => {
            return {
                clientToken: {
                    generate: generate
                }
            };
        }),
        Environment: {
            Sandbox: 'sandbox'
        },
    };
});

describe('productController', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
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

        test('should handle error thrown in try block', async () => {
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
            const error = new Error('Test error');
            const gateway = new braintree.BraintreeGateway();
            gateway.clientToken.generate.mockImplementation(() => {
                throw error;
            });

            await braintreeTokenController(req, res);

            expect(consoleLogSpy).toHaveBeenCalledWith(error);
        });
    });
});
