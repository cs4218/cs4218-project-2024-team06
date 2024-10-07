import mongoose from 'mongoose';
import connectDB from './db';

jest.mock("mongoose", () => ({
    connect: jest.fn(),
}));

describe('connectDB', () => {
    let consoleLogSpy;

    beforeEach(() => {
        jest.clearAllMocks();

        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    })

    test('connection succesful', async () => {
        mongoose.connect.mockResolvedValue({
            connection: { host: 'test-connection' }
        });
        await connectDB();

        expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URL);
        expect(consoleLogSpy).toHaveBeenCalledWith('Connected To Mongodb Database test-connection'.bgMagenta.white);
    });

    test.failing('connection unsuccessful', async () => {
        const error = new Error('connection error');
        mongoose.connect.mockRejectedValue(error);
        await connectDB();

        expect(consoleLogSpy).toHaveBeenCalledWith('Error in Mongodb: connection error'.bgRed.white);
    })
});