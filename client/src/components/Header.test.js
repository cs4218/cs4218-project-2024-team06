import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./Header";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import useCategory from "../hooks/useCategory";
import SearchInput from "./Form/SearchInput";
import toast from "react-hot-toast";
import '@testing-library/jest-dom/extend-expect';
import { describe } from "node:test";

jest.mock('../context/auth');
jest.mock('../context/cart');
jest.mock('../hooks/useCategory');
jest.mock('react-hot-toast');
jest.mock('./Form/SearchInput', () => () => (
    <div data-testid='mock-search-input'>
        Search
    </div>
));
jest.mock('antd', () => ({
    Badge: ({ count, children }) => (
        <span data-testid='mock-badge' data-count={count}>
            {children}
        </span>
    ),
}));

Object.defineProperty(window, 'localStorage', {
    value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
    },
    writable: true,
});

describe('Header component', () => {
    const setAuthMock = jest.fn();
    const renderComponent = () => {
        render(
            <Router>
                <Header />
            </Router>
        )
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Default mocks for all tests
        useAuth.mockReturnValue([{ user: null, token: "" }, setAuthMock]);
        useCart.mockReturnValue([[]]); // Mock empty cart by default
        useCategory.mockReturnValue([]); // Mock no categories by default
    });

    describe('when user is not logged in', () => {
        test('renders correctly with no item in cart', () => {
            renderComponent();
            const badge = screen.getByTestId('mock-badge');

            expect(screen.getByTestId('mock-search-input')).toBeInTheDocument();
            expect(badge).toHaveAttribute('data-count', '0');

            expect(screen.getByText('🛒 Virtual Vault')).toHaveAttribute('href', '/');
            expect(screen.getByText('Home')).toHaveAttribute('href', '/');
            expect(screen.getByText('Register')).toHaveAttribute('href', '/register');
            expect(screen.getByText('Login')).toHaveAttribute('href', '/login');
            expect(screen.getByText('Cart')).toHaveAttribute('href', '/cart');
        });

        test('displays categories and renders link properly', () => {
            const categories = [
                { name: 'test-cat-1', slug: 'test-cat-1-slug' },
                { name: 'test-cat-2', slug: 'test-cat-2-slug' },
            ]
            useCategory.mockReturnValue(categories);
            
            renderComponent();
            const categoriesButton = screen.getByText('Categories');
            fireEvent.click(categoriesButton);

            expect(screen.getByText('Categories')).toBeInTheDocument();
            expect(screen.getByText('All Categories')).toBeInTheDocument();
            expect(screen.getByText('test-cat-1')).toBeInTheDocument();
            expect(screen.getByText('test-cat-2')).toBeInTheDocument();
            expect(screen.getByText('test-cat-1')).toHaveAttribute('href', '/category/test-cat-1-slug');
            expect(screen.getByText('test-cat-2')).toHaveAttribute('href', '/category/test-cat-2-slug');
        });
    })

    describe('when user is logged in', () => {
        test('renders user specific elements with item in cart', () => {
            useAuth.mockReturnValue([{
                user: { name: 'test-user', role: 0 },
                token: 'test-token',
                setAuthMock
            }]);
            useCart.mockReturnValue([[{ id: 1 }, { id: 2 }]]);
            
            renderComponent();
            const badge = screen.getByTestId('mock-badge');

            expect(screen.getByText('test-user')).toBeInTheDocument();
            expect(screen.getByText('Cart')).toBeInTheDocument();
            expect(badge).toHaveAttribute('data-count', '2');

            expect(screen.getByText('Logout')).toHaveAttribute('href', '/login');
            expect(screen.getByText('Dashboard')).toBeInTheDocument('href', '/dashboard/user');
        });

        test('handles logout functionality', () => {
            useAuth.mockReturnValue([{
                user: { name: 'test-user', role: 0 },
                token: 'test-token',
            },
                setAuthMock,
            ]);
            renderComponent();
            const logoutButton = screen.getByText('Logout');
            fireEvent.click(logoutButton);

            expect(setAuthMock).toHaveBeenCalledWith({
                user: null,
                token: ''
            })
            expect(toast.success).toHaveBeenCalledWith('Logout Successfully');
            expect(window.localStorage.removeItem).toHaveBeenCalledWith('auth');
        })
    });
});