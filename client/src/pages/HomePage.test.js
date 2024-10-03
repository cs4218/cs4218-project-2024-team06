// @ts-nocheck
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { useCart } from "../context/cart";
import '@testing-library/jest-dom/extend-expect';
import HomePage from "./HomePage";
import axios from "axios";
import { AiOutlineReload } from "react-icons/ai";
import { Checkbox, Radio } from "antd";


// Mock Layout component
jest.mock("../components/Layout", () => ({ children }) => <div>{children}</div>);

// Mock Prices component
jest.mock("../components/Prices", () => ({
    Prices: [
        { _id: '1', name: '$0 - $50', array: [0, 50] },
        { _id: '2', name: '$51 - $110', array: [51, 110] },
    ],
}));

// Mock toast
jest.mock("react-hot-toast", () => ({
    success: jest.fn(),
}));

// Mock axios
jest.mock('axios');

// Mock cart context
jest.mock('../context/cart', () => ({
    useCart: jest.fn(),
}));

const renderComponent = () => {
    render(
        <Router>
            <HomePage />
        </Router>
    )
};

describe('HomePage component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useCart.mockReturnValue([[], jest.fn()]);

        axios.get.mockImplementation((url) => {
            if (url === "/api/v1/category/get-category") {
                return Promise.resolve({
                    data: {
                        success: true,
                        category:
                            [
                                { _id: '1', name: 'Category 1' },
                                { _id: '2', name: 'Category 2' },
                            ]
                    }
                });
            }
            if (url === "/api/v1/product/product-list/1") {
                return Promise.resolve({
                    data: {
                        success: true,
                        products:
                            [
                                {
                                    _id: '1',
                                    name: 'Product 1',
                                    price: 20,
                                    description: 'Description 1',
                                    category: '1'
                                },
                                {
                                    _id: '2',
                                    name: 'Product 2',
                                    price: 100,
                                    description: 'Description 2',
                                    category: '2'
                                }
                            ]
                    }
                });
            }
            if (url === "/api/v1/product/product-count") {
                return Promise.resolve({
                    data: { total: 2 }
                })
            }
        });
        axios.post.mockResolvedValueOnce({
            data: {
                products: [
                    {   
                        _id: '1',
                        name: 'Product 1',
                        price: 20,
                        description: 'Description 1',
                        category: '1' 
                    },
                ],
            },
        });
    });

    test('should fetch categories and products and render properly', async () => {
        renderComponent();

        await expect(screen.findByText('Category 1')).resolves.toBeInTheDocument();
        await expect(screen.findByText('Category 2')).resolves.toBeInTheDocument();
        await expect(screen.findByText('Product 1')).resolves.toBeInTheDocument();
        await expect(screen.findByText('Product 2')).resolves.toBeInTheDocument();
    });

    test('should filter products based on selected categories', async () => {
        renderComponent();

        await screen.findByText('Category 1');
        await screen.findByText('Category 2');

        fireEvent.click(screen.getByText('Category 1'));

        expect(await screen.findByText('Product 1')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.queryByText('Product 2')).not.toBeInTheDocument();
        });
    })

    test('should filter products based on prices', async () => {
        renderComponent();

        await screen.findByText('$0 - $50');
        await screen.findByText('$51 - $110');

        fireEvent.click(screen.getByText('$0 - $50'));

        expect(await screen.findByText('Product 1')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.queryByText('Product 2')).not.toBeInTheDocument();
        });
    })

    test.failing('should go to next page when click loadmore button', async () => {
        axios.get.mockImplementation((url) => {
            if (url === "/api/v1/product/product-count") {
                return Promise.resolve({
                    data: { total: 3 }
                })
            }
            if (url === "/api/v1/product/product-list/2") {
                return Promise.resolve({
                    data: {
                        success: true,
                        products:
                            [
                                {
                                    _id: '3',
                                    name: 'Product 3',
                                    price: 20,
                                    description: 'Product on page 2',
                                    category: '1'
                                },
                            ]
                    }
                });
            }
        });

        renderComponent();
        const loadmore = await screen.findByText('Loadmore');
        fireEvent.click(loadmore);

        expect(await screen.findByText('Product 3')).toBeInTheDocument();
        expect(await screen.findByText(/Product on page 2/)).toBeInTheDocument();
        expect(screen.queryByText('Loadmore')).not.toBeInTheDocument();
    });
});