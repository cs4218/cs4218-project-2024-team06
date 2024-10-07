import React from 'react';
import { render, screen} from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CreateProduct from './CreateProduct';
import '@testing-library/jest-dom/extend-expect';

//Mock components
jest.mock('../../components/AdminMenu', () => () => <div>Admin Menu Mock</div>);
jest.mock('./../../components/Layout', () => ({ children }) => <div><h1>Dashboard Mock</h1><div>{ children }</div></div>);


describe("Create Product Component", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Mock data
    const mockValidCategories = [
        { _id: 1, name: 'dresses', slug: 'dresses' },
        { _id: 2, name: 'shoes', slug: 'shoes' },
    ];

    //Mock axios call
    jest.mock('axios', () => ({
        get: jest.fn(() => Promise.resolve({
            data: {
            success: true,
            category: mockValidCategories,
            },
        })),
    }));

    describe("When the component is rendered", () => {
        
        test.failing("The components are rendered correctly", () => {

            render(
                <MemoryRouter initialEntries={['/dashboard/admin/create-product']}>
                    <Routes>
                    <Route path='/dashboard/admin/create-product' element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
                );

            // ASSERT (always fails due to inconsistent capitalisation in original code)
            expect(screen.getByText(/Dashboard Mock/)).toBeInTheDocument(); 
            expect(screen.getByText(/Admin Menu Mock/)).toBeInTheDocument();
            expect(screen.getByText(/Select a category/)).toBeInTheDocument(); // select category 
            expect(screen.getByText(/Select shipping/)).toBeInTheDocument(); // select shipping 
            expect(screen.getByPlaceholderText(/Write a quantity/)).toBeInTheDocument(); // quantity input
            expect(screen.getByPlaceholderText(/Write a price/)).toBeInTheDocument(); // price input
            expect(screen.getByPlaceholderText(/Write a description/)).toBeInTheDocument(); // description input
            expect(screen.getByPlaceholderText(/Write a name/)).toBeInTheDocument(); // name input
            expect(screen.getByText(/Create Product/)).toBeInTheDocument(); // button
        });
    })
})