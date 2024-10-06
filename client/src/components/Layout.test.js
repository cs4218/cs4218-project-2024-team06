import React from "react";
import Footer from './Footer';
import Header from './Header';
import Layout from './Layout';
import { Helmet } from "react-helmet";
import { Toaster } from 'react-hot-toast';
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';

jest.mock('react-hot-toast', () => {
    return {
        Toaster: () => <div>Toaster Mock</div> 
    };
});

jest.mock('react-helmet', () => {
    return {
        Helmet: ({ children }) => 
            <div>{children}</div>,
    };
});

jest.mock('./Footer', () => () => <div>Footer Mock</div>);
jest.mock('./Header', () => () => <div>Header Mock</div>);

describe('Layout component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should render component correctly', () => {
        render(
            <Layout>
                <div>Child</div>
            </Layout>
        );

        expect(screen.getByText('Ecommerce app - shop now')).toBeInTheDocument();
        expect(document.querySelector('meta[name="description"]').getAttribute('content')).toBe('mern stack project');
        expect(document.querySelector('meta[name="keywords"]').getAttribute('content')).toBe('mern,react,node,mongodb');
        expect(document.querySelector('meta[name="author"]').getAttribute('content')).toBe('Techinfoyt');

        expect(screen.getByText('Toaster Mock')).toBeInTheDocument();
        expect(screen.getByText('Footer Mock')).toBeInTheDocument();
        expect(screen.getByText('Header Mock')).toBeInTheDocument();
        expect(screen.getByText('Child')).toBeInTheDocument();
    });
});
