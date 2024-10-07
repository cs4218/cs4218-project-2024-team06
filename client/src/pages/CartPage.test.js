import React from "react";
import Layout from "./../components/Layout";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import axios from "axios";
import toast from "react-hot-toast";
import DropIn from "braintree-web-drop-in-react";
import CartPage from "./CartPage";
import { BrowserRouter as Router } from "react-router-dom";
import { fireEvent, render, screen, waitFor, act } from '@testing-library/react';
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
jest.mock('braintree-web-drop-in-react', () => ({
    __esModule: true,
    default: ({ onInstance }) => {
        setTimeout(() => {
            const mockInstance = {
                requestPaymentMethod: jest.fn().mockResolvedValue({ nonce: 'mock-nonce' }),
            };

            onInstance(mockInstance); // Call onInstance with the mock instance
        }, 0);
        return null; // Return a mock component
    },
}));

Object.defineProperty(window, 'localStorage', {
    value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
    },
    writable: true,
});

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

    describe('cart item removal', () => {
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
    });

    describe('is logged in', () => {
        beforeEach(() => {
            mockAuth = {
                token: 'test-token',
                user: { name: 'test-user', address: 'test-address' },
            }
            mockCart = [
                { _id: 1, name: 'macbook', description: 'best laptop', price: 1000 },
                { _id: 2, name: 'book', description: 'best book', price: 20 },
            ];
            setupMocks();
        });

        test.failing('should render correctly with address and non empty cart', () => {
            renderComponent();
            const button = screen.getByText('Update Address');

            expect(screen.getByAltText('macbook')).toHaveAttribute('src', '/api/v1/product/product-photo/1');
            expect(screen.getByText('best laptop')).toBeInTheDocument();
            expect(screen.getByText('Price : 1000')).toBeInTheDocument();
            expect(screen.getByText('Total : $1,020.00')).toBeInTheDocument();
            expect(screen.getByText('You have 2 items in your cart')).toBeInTheDocument();

            fireEvent.click(button);

            expect(screen.getByText('Current Address')).toBeInTheDocument();
            expect(screen.getByText('test-address')).toBeInTheDocument();
            expect(screen.getByText('Update Address')).toBeInTheDocument();
            expect(window.location.pathname).toBe('/dashboard/user/profile');
        });
    });

    describe('is not logged in', () => {
        test.failing('should render correctly with non empty cart', () => {
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
            axios.get.mockImplementation(() => Promise.resolve({ data: { clientToken: 'mock-token' } }));

            mockAuth = {
                token: 'test-token',
                user: { name: 'test-user', address: 'test-address' },
            }

            mockCart = [{ _id: 1, name: 'macbook', description: 'best laptop', price: 1000 }];
            setupMocks();
        });

        test.failing('should handle payment correctly', async () => {
            axios.post.mockImplementation(() => Promise.resolve({ data: { success: true } }));

            await act(async () => {
                renderComponent();
            });

            const paymentButton = await screen.findByText('Make Payment');
            await waitFor(() => {
                expect(paymentButton).not.toBeDisabled();
            });
            fireEvent.click(paymentButton);

            await waitFor(() => {
                expect(window.localStorage.removeItem).toHaveBeenCalledWith('cart');
                expect(window.location.pathname).toBe('/dashboard/user/orders');
                expect(toast.success).toHaveBeenCalledWith("Payment Completed Successfully");
            });
        });

    });
}); 
