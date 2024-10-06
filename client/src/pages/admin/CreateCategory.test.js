import React from 'react';
import axios from "axios";
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CreateCategory from './CreateCategory';
import '@testing-library/jest-dom/extend-expect';

//Mock components
jest.mock('axios');
jest.mock('../../components/AdminMenu', () => () => <div>Admin Menu Mock</div>);
jest.mock('./../../components/Layout', () => ({ children }) => <div><h1>Dashboard Mock</h1><div>{ children }</div></div>);
jest.mock('./../../components/Form/CategoryForm', () => ({ children }) => <div><h1>Category Form Mock</h1><div>{ children }</div></div>);


describe("Create Category Component", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });


    describe("When the component is rendered", () => {
        
        test("The different components are rendered with successfull fetching of categories", async () => {

            //ARRANGE
            // Mock data
            const mockValidCategories = [
                { _id: 1, name: 'dresses', slug: 'dresses' },
                { _id: 2, name: 'shoes', slug: 'shoes' },
                { _id: 3, name: 'books', slug: 'books' },
                { _id: 4, name: 'food', slug: 'food' },
                { _id: 5, name: 'toys', slug: 'toys' },
                { _id: 6, name: 'pants', slug: 'pants' },
            ];

            //ACT
            await axios.get.mockResolvedValueOnce({ data: {success: true, category: mockValidCategories }});
        
            render(
                <MemoryRouter initialEntries={['/dashboard/admin/create-category']}>
                    <Routes>
                    <Route path='/dashboard/admin/create-category' element={<CreateCategory />} />
                    </Routes>
                </MemoryRouter>
                );

            // ASSERT (always fails due to inconsistent capitalisation in original code)
            await waitFor(() => {
                expect(screen.getByText(/Dashboard Mock/)).toBeInTheDocument(); 
                expect(screen.getByText(/Admin Menu Mock/)).toBeInTheDocument();
                expect(screen.getByText(/Category Form Mock/)).toBeInTheDocument();
                expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
                expect(screen.getByText('dresses')).toBeInTheDocument();
                expect(screen.getByText('shoes')).toBeInTheDocument();
                expect(screen.getByText('toys')).toBeInTheDocument();
                expect(screen.getByText('food')).toBeInTheDocument();
                expect(screen.getByText('pants')).toBeInTheDocument();
            });
            
        });
    })
})