import React from "react";
import axios from "axios";
import Categories from "../pages/Categories";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import '@testing-library/jest-dom/extend-expect';
import Layout from "../components/Layout";

jest.mock('../components/Layout', () => ({ title, children }) => (
    <div>
        <h1>{title}</h1>
        <div>{children}</div>
    </div>
));
jest.mock('axios');

describe('useCategory Integration', () => {
    test('should call useCategory to fetch categories and display', async () => {
        const categoriesData = [
                { _id: '1', name: 'Category 1', slug: 'category-1' },
                { _id: '2', name: 'Category 2', slug: 'category-2' },
            ];
        axios.get.mockResolvedValue({ data: { category: categoriesData } });

        render(
            <Router>
                <Categories />
            </Router>
        );

        await waitFor(() => {
            expect(screen.getByText('Category 1')).toBeInTheDocument();
            expect(screen.getByText('Category 2')).toBeInTheDocument();
        });
    });
});
