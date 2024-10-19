import { braintreeTokenController } from "./productController";

describe('product controller integration test', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            send: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
    });

    test.failing('braintree token should be generated correctly', async () => {
        await braintreeTokenController(req, res);

        const response = res.send.mock.calls[0][0];
        expect(response).toHaveProperty('clientToken');
        expect(typeof response.clientToken).toBe('string');
    });
});