import React from "react";
import { render, waitFor, screen } from '@testing-library/react';
import axios from "axios";
import toast from 'react-hot-toast';
import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Products from "./Products";


jest.mock('axios');
jest.mock('../../components/AdminMenu', () => () => <div>Admin Menu Mock</div>);
jest.mock('./../../components/Layout', () => ({ title, children }) => (<div><h1>{title}</h1><div>{children}</div></div>));
jest.mock('react-hot-toast', () => ({
    error: jest.fn(),
}));

describe('Products component', () => {

    beforeAll(() => jest.clearAllMocks());

    test('Renders products available correctly', async () => {
        
        //ARRANGE
        const mockResponse = [{
            _id: 1,
            name: "pdt1",
            slug: "pdt1",
            description: "desc1"
        },
        {
            _id: 2,
            name: "pdt2",
            slug: "pdt2",
            description: "desc2"
        },
        ];

        //ACT
        await axios.get.mockResolvedValueOnce({ data: {products: mockResponse }});
        render(
            <MemoryRouter initialEntries={['/dashboard/admin/products']}>
                <Routes>
                    <Route path='/dashboard/admin/products' element={<Products />} />
                </Routes>
            </MemoryRouter>
        );

         //ASSERT
        await waitFor(() => {
            expect(screen.getByText('All Products List')).toBeInTheDocument();
            expect(axios.get).toHaveBeenCalledWith("/api/v1/product/get-product");
            expect(screen.getByText('pdt1')).toBeInTheDocument();
            expect(screen.getByText('desc1')).toBeInTheDocument();
            expect(screen.getByText('pdt2')).toBeInTheDocument();
            expect(screen.getByText('desc2')).toBeInTheDocument();
        });
    });

    test.failing('Renders toast of error when the call to fetch product fails', async () => {
    
        //ACT
        await axios.get.mockRejectedValue(new Error("Database error"));
        render(
            <MemoryRouter initialEntries={['/dashboard/admin/products']}>
                <Routes>
                    <Route path='/dashboard/admin/products' element={<Products />} />
                </Routes>
            </MemoryRouter>
        );

         //ASSERT (Always fails due to spelling mistake in error message in original code)
        await waitFor(() => {
            expect(screen.getByText('All Products List')).toBeInTheDocument();
            expect(axios.get).toHaveBeenCalledWith("/api/v1/product/get-product");
            expect(toast.error).toHaveBeenCalledTimes(1);
            expect(toast.error).toHaveBeenCalledWith('Something Went Wrong');
        });
    });
});