import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminMenu  from './AdminMenu.js';
import React from "react";
import '@testing-library/jest-dom/extend-expect';


//Test suite
describe('AdminMenu Component', () => {

    //Initialisation logic for all tests
    beforeEach(() => {
        jest.clearAllMocks();
    });

    
    //Links
    describe('should have links correctly placed with the labels', () => {

        it('where pressing Create Category goes to admin create category page', () => {
            //ARRANGE
          
            //ACTION
            render(
                <MemoryRouter initialEntries={['/dashboard/admin']}>
                    <Routes>
                        <Route path="/dashboard/admin" element={<AdminMenu />} />
                        <Route path="/dashboard/admin/create-category" element={<div>Create Category Title</div>} />
                    </Routes>
                </MemoryRouter>
            );
            
            fireEvent.click(screen.getByText('Create Category'));

            //ASSERT
            expect(screen.getByText("Create Category Title")).toBeInTheDocument();
        });


        it('where pressing Create Product goes to admin create product page', () => {
            //ARRANGE
          
            //ACTION
            render(
                <MemoryRouter initialEntries={['/dashboard/admin']}>
                    <Routes>
                        <Route path="/dashboard/admin" element={<AdminMenu />} />
                        <Route path="/dashboard/admin/create-product" element={<div>Create Product Title</div>} />
                    </Routes>
                </MemoryRouter>
            );
            
            fireEvent.click(screen.getByText('Create Product'));

            //ASSERT
            expect(screen.getByText("Create Product Title")).toBeInTheDocument();
        });


        it('where pressing Products goes to admin products page', () => {
            //ARRANGE
          
            //ACTION
            render(
                <MemoryRouter initialEntries={['/dashboard/admin']}>
                    <Routes>
                        <Route path="/dashboard/admin" element={<AdminMenu />} />
                        <Route path="/dashboard/admin/products" element={<div>Products Title</div>} />
                    </Routes>
                </MemoryRouter>
            );
            
            fireEvent.click(screen.getByText('Products'));

            //ASSERT
            expect(screen.getByText("Products Title")).toBeInTheDocument();
        });


        it('where pressing Orders goes to admin orders page', () => {
            //ARRANGE
          
            //ACTION
            render(
                <MemoryRouter initialEntries={['/dashboard/admin']}>
                    <Routes>
                        <Route path="/dashboard/admin" element={<AdminMenu />} />
                        <Route path="/dashboard/admin/orders" element={<div>Orders Title</div>} />
                    </Routes>
                </MemoryRouter>
            );
            
            fireEvent.click(screen.getByText('Orders'));

            //ASSERT
            expect(screen.getByText("Orders Title")).toBeInTheDocument();
        });
    });
});