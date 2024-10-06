import { render, screen} from '@testing-library/react';
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
  
    //Check links and labels
    describe('should have links correctly placed with the labels', () => {

        it('where the links are present and the routes should be correct', () => {
            //ARRANGE
          
            //ACTION
            render(
                <MemoryRouter initialEntries={['/dashboard/admin']}>
                    <Routes>
                        <Route path="/dashboard/admin" element={<AdminMenu />} />
                    </Routes>
                </MemoryRouter>   
            );

            //ASSERT
            expect(screen.getByText("Create Category")).toBeInTheDocument();
            expect(screen.getByText("Create Category").closest('a')).toHaveAttribute('href', '/dashboard/admin/create-category');
            expect(screen.getByText("Create Product")).toBeInTheDocument();
            expect(screen.getByText("Create Product").closest('a')).toHaveAttribute('href', '/dashboard/admin/create-product');
            expect(screen.getByText("Products")).toBeInTheDocument();
            expect(screen.getByText("Products").closest('a')).toHaveAttribute('href', '/dashboard/admin/products');
            expect(screen.getByText("Orders")).toBeInTheDocument();
            expect(screen.getByText("Orders").closest('a')).toHaveAttribute('href', '/dashboard/admin/orders');
        });
    });
});
