import { braintreeTokenController, brainTreePaymentController } from "./productController";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

describe('product controller integration test', () => {
    let req, res, mongoServer;

    beforeEach(async () => {
        jest.clearAllMocks();

        req = {};
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

        mongoServer = await MongoMemoryServer.create();
        const mongoDbUri = mongoServer.getUri();
        await mongoose.connect(mongoDbUri);
    });

    afterEach(async () => {
        await mongoose.connection.dropDatabase();

        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test.failing('braintree token should be generated correctly', async () => {
        await braintreeTokenController(req, res);

        const response = res.send.mock.calls[0][0];
        expect(response).toHaveProperty('clientToken');
        expect(typeof response.clientToken).toBe('string');
    });

    test.failing('braintree payment controller should accept payment correctly', async () => {
        req = {
            body: {
                nonce: 'fake-valid-visa-nonce',
                cart: [
                    { _id: new mongoose.Types.ObjectId(), price: 10 },
                    { _id: new mongoose.Types.ObjectId(), price: 20 },
                ],
            },
            user: {
                _id: new mongoose.Types.ObjectId(),
            },
        };

        await brainTreePaymentController(req, res);

        expect(res.json).toHaveBeenCalledWith({ ok: true });
    });
});