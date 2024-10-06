import React from 'react';
import Footer from "./Footer";
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';

describe('Footer component', () => {
    test('renders footer component correctly', () => {
        const { getByText } = render(
            <Router>
                <Footer/>
            </Router>
        )
        // Assert text
        expect(getByText('All Rights Reserved © TestingComp')).toBeInTheDocument();
        expect(getByText('About')).toBeInTheDocument();
        expect(getByText('Contact')).toBeInTheDocument();
        expect(getByText('Privacy Policy')).toBeInTheDocument();

        // Assert links 
        expect(getByText('About')).toHaveAttribute('href', '/about');
        expect(getByText('Contact')).toHaveAttribute('href', '/contact');
        expect(getByText('Privacy Policy')).toHaveAttribute('href', '/policy');
    });
});