import React from 'react';
import Footer from "./Footer";
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';

describe('Footer component', () => {
    test('renders footer component', () => {
        const { getByText } = render(
            <Router>
                <Footer/>
            </Router>
        )
        expect(getByText('All Rights Reserved © TestingComp')).toBeInTheDocument();
        expect(getByText('About')).toBeInTheDocument();
        expect(getByText('Contact')).toBeInTheDocument();
        expect(getByText('Privacy Policy')).toBeInTheDocument();
    });

    test('renders all links with correct attribute', () => {
        const { getByText } = render(
            <Router>
                <Footer/>
            </Router>
        )
        expect(getByText('About')).toHaveAttribute('href', '/about');
        expect(getByText('Contact')).toHaveAttribute('href', '/contact');
        expect(getByText('Privacy Policy')).toHaveAttribute('href', '/policy');
    })
});