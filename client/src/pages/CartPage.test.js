import React from "react";
import Layout from "./../components/Layout";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import axios from "axios";
import toast from "react-hot-toast";
import DropIn from "braintree-web-drop-in-react";
import CartPage from "./CartPage";
import { BrowserRouter as Router } from "react-router-dom";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

jest.mock('./../components/Layout', () => ({ children }) => (<div>{children}</div>));
jest.mock('../context/cart', () => ({
    useCart: jest.fn()
}));
jest.mock('../context/auth', () => ({
    useAuth: jest.fn()
}));
jest.mock('axios');
jest.mock('react-hot-toast', () => ({
    success: jest.fn(),
    error: jest.fn(),
}));

const renderComponent = () => {
    render(
        <Router>
            <CartPage />
        </Router>
    );
};

describe('CartPage component', () => {
    let mockAuth, mockCart;

    const setupMocks = () => {
        useAuth.mockReturnValue([mockAuth, jest.fn()]);
        useCart.mockReturnValue([mockCart, jest.fn()]);
    };

    beforeEach(() => {
        jest.clearAllMocks();

        mockAuth = null;
        mockCart = [];

        setupMocks();
    });

    test('should handle cart item removal correctly', () => {
        mockCart = [
            { _id: 1, name: 'macbook', description: 'best laptop', price: 1000 },
            { _id: 2, name: 'book', description: 'best book', price: 20 },
        ];
        const setCartMock = jest.fn();
        setupMocks();

        useCart.mockReturnValue([mockCart, setCartMock]);

        renderComponent();

        const removeButton = screen.queryAllByText('Remove')[0];
        fireEvent.click(removeButton);

        expect(setCartMock).toHaveBeenCalledWith([
            { _id: 2, name: 'book', description: 'best book', price: 20 }
        ]);
    });

    test('should handle error during cart item removal', () => {
        mockCart = [
            { _id: 1, name: 'macbook', description: 'best laptop', price: 1000 },
            { _id: 2, name: 'book', description: 'best book', price: 20 },
        ];

        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const error = new Error('Cart removal error');
        useCart.mockReturnValue([mockCart, () => { throw error }]);

        renderComponent();
        const removeButton = screen.queryAllByText('Remove')[0];
        fireEvent.click(removeButton);

        expect(consoleLogSpy).toHaveBeenCalledWith(error);
    });

    describe('is logged in', () => {
        beforeEach(() => {
            mockAuth = {
                token: 'test-token',
                user: { name: 'test-user', address: 'test-address' },
            }
            setupMocks();
        });


        describe('has username', () => {
            test('should render correctly with empty cart', () => {
                mockCart = [];
                setupMocks();

                renderComponent();

                expect(screen.getByText('Hello test-user')).toBeInTheDocument();
                expect(screen.getByText('Your Cart Is Empty')).toBeInTheDocument();
            });

            test('should render correctly with non empty cart', () => {
                mockCart = [
                    { _id: 1, name: 'macbook', description: 'best laptop', price: 1000 },
                    { _id: 2, name: 'book', description: 'best book', price: 20 },
                ];
                setupMocks();

                renderComponent();

                expect(screen.getByAltText('macbook')).toHaveAttribute('src', '/api/v1/product/product-photo/1');
                expect(screen.getByText('best laptop')).toBeInTheDocument();
                expect(screen.getByText('Price : 1000')).toBeInTheDocument();
                expect(screen.getByText('Total : $1,020.00')).toBeInTheDocument();
                expect(screen.getByText('You have 2 items in your cart')).toBeInTheDocument();
            });

            test('should render correctly with address', () => {
                renderComponent();
                const button = screen.getByRole('button', 'Update Address');
                fireEvent.click(button);

                expect(screen.getByText('Current Address')).toBeInTheDocument();
                expect(screen.getByText('test-address')).toBeInTheDocument();
                expect(screen.getByText('Update Address')).toBeInTheDocument();
                expect(window.location.pathname).toBe('/dashboard/user/profile');
            });

            test('should render correctly with no address', () => {
                mockAuth = {
                    token: 'test-token',
                    user: { name: 'test-user', address: null },
                }
                setupMocks();

                renderComponent();
                const button = screen.getByRole('button', 'Update Address');
                fireEvent.click(button);

                expect(screen.queryByText('Current Address')).not.toBeInTheDocument();
                expect(screen.queryByText('test-address')).not.toBeInTheDocument();
                expect(screen.getByText('Update Address')).toBeInTheDocument();
                expect(window.location.pathname).toBe('/dashboard/user/profile');
            });
        });
    });

    describe('is not logged in', () => {
        test('should render correctly with empty cart', () => {
            renderComponent();

            expect(screen.getByText('Hello Guest')).toBeInTheDocument();
            expect(screen.getByText('Your Cart Is Empty')).toBeInTheDocument();
        });

        test('should render correctly with non empty cart', () => {
            mockCart = [
                { _id: 1, name: 'macbook', description: 'best laptop', price: 1000 },
                { _id: 2, name: 'book', description: 'best book', price: 20 },
            ];
            setupMocks();

            renderComponent();
            const button = screen.getByText('Please login to checkout');
            fireEvent.click(button);

            expect(screen.getByText('You have 2 items in your cart please login to checkout!')).toBeInTheDocument();
            expect(screen.getByText('Please login to checkout')).toBeInTheDocument();
            expect(window.location.pathname).toBe('/login');
        });
    });

    describe('payment', () => {
        beforeEach(() => {
            axios.get.mockImplementation((url) => {
                if (url === '/api/v1/product/braintree/token') {
                    return Promise.resolve({ data: { clientToken: 'mock-token' } });
                }
                return Promise.reject(new Error('Not Found'));
            });

            mockAuth = {
                token: 'test-token',
                user: { name: 'test-user', address: 'test-address' },
            }

            mockCart = [{ _id: 1, name: 'macbook', description: 'best laptop', price: 1000 }];
            setupMocks();
        });

        test('renders payment button when conditions are met', async () => {
            renderComponent();

            const paymentButton = await screen.findByText('Make Payment');
            expect(paymentButton).toBeInTheDocument();
        });

        test('handles payment correctly', async () => {
            const handlePayment = jest.fn();
            axios.post.mockResolvedValue({ data: {} });

            // Similar setup as before
            renderComponent();
            const instance = { requestPaymentMethod: jest.fn().mockResolvedValue({ nonce: 'fake-nonce' }) };
            const paymentButton = await screen.findByText('Make Payment');
            fireEvent.click(paymentButton);

            expect(handlePayment).toHaveBeenCalled();
            // expect(axios.post).toHaveBeenCalledWith("/api/v1/product/braintree/payment", {
            //     nonce: 'test-nonce',
            //     cart: expect.anything(), // Assuming cart is passed correctly
            // });

            // expect(toast.success).toHaveBeenCalledWith('Payment Completed Successfully ');

            // Optionally check navigation or other side effects
            // expect(window.location.pathname).toBe('/dashboard/user/orders');
        });
    });
}); 
