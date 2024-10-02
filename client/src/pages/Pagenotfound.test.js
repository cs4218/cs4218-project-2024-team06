import React from "react";
import Pagenotfound from './Pagenotfound';
import Layout from "../components/Layout";
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from "react-router-dom";
import '@testing-library/jest-dom/extend-expect';

// Mock layout component
jest.mock('../components/Layout', () => ({ title, children }) => (
    <div data-testid='mock-layout'>
        <h1>{title}</h1>
        <div>{children}</div>
    </div>
));

describe('Pagenotfound component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    const renderComponent = () => {
        render(
            <Router>
                <Pagenotfound />
            </Router>
        )
    }

    test('renders page correctly', () => {
        renderComponent();

        expect(screen.getByText('go back- page not found')).toBeInTheDocument();
        expect(screen.getByText('404')).toBeInTheDocument();
        expect(screen.getByText('Oops ! Page Not Found')).toBeInTheDocument();
        expect(screen.getByText('Go Back')).toBeInTheDocument();
        expect(screen.getByText('Go Back')).toHaveAttribute('href', '/');
    });
});