import React from "react";
import About from "./About";
import Layout from "../components/Layout";
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

// Mock layout component
jest.mock('../components/Layout', () => ({title, children}) => (
    <div data-testid='mock-layout'>
        <h1>{title}</h1>
        <div>{children}</div>
    </div>
));

describe('About component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    test.failing('renders component correctly', () => {
        render(<About/>);
        const image = screen.getByAltText("aboutus");

        // Assert that layout component is rendered
        expect(screen.getByTestId('mock-layout')).toBeInTheDocument();

        // Assert text rendering
        expect(screen.getByText('About us - Ecommerce app')).toBeInTheDocument();
        expect(screen.getByText('Add text')).toBeInTheDocument();

        // Assert image rendering
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', '/images/about.jpeg');
    })
});
