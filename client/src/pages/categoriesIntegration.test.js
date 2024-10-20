import React from "react";
import axios from "axios";
import Categories from "../pages/Categories";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import '@testing-library/jest-dom/extend-expect';
import { AuthProvider } from "../context/auth";
import { CartProvider } from "../context/cart";
import { SearchProvider } from "../context/search";

jest.mock('axios');

describe('integration of categories with layout and useCategory', () => {
    test('should call useCategory to fetch categories and display', async () => {
        const categoriesData = [
            { _id: '1', name: 'Category 1', slug: 'category-1' },
            { _id: '2', name: 'Category 2', slug: 'category-2' },
        ];
        axios.get.mockResolvedValue({ data: { category: categoriesData } });

        render(
            <AuthProvider>
                <CartProvider>
                    <SearchProvider>
                        <Router>
                            <Categories />
                        </Router>
                    </SearchProvider>
                </CartProvider>
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getAllByText('Category 1').length).toBeGreaterThan(0);
            expect(screen.getAllByText('Category 2').length).toBeGreaterThan(0);
        });
    });
});
