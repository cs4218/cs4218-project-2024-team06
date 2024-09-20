import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import Layout from "../components/Layout";
import Categories from "./Categories";
import useCategory from "../hooks/useCategory";

jest.mock('../components/Layout', () => ({ title, children }) => (
    <div>
        <h1>{title}</h1>
        <div>{children}</div>
    </div>
));

jest.mock('../hooks/useCategory')

const renderComponent = () => {
    render(
        <Router>
            <Categories/>
        </Router>
    )
};

describe('Categories component', () => {
    beforeEach(() => {
        useCategory.mockReturnValue([
            { _id: 1, name: 'Electronics', slug: 'ElectronicsSlug' },
            { _id: 2, name: 'Books', slug: 'BooksSlug' },
        ]);
    });


    test('should render text correctly', () => {
        renderComponent();

        expect(screen.getByText('All Categories')).toBeInTheDocument();
        expect(screen.getByText('Electronics')).toBeInTheDocument();
        expect(screen.getByText('Books')).toBeInTheDocument();
    });

    test('should render links correctly', () => {
        renderComponent();
        
        expect(screen.getByText('Electronics')).toHaveAttribute('href', '/category/ElectronicsSlug');
        expect(screen.getByText('Books')).toHaveAttribute('href', '/category/BooksSlug');
    })
});