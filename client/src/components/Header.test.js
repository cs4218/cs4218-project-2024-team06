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

jest.mock('../context/auth');
jest.mock('../context/cart');
jest.mock('../hooks/useCategory');
jest.mock('react-hot-toast');
jest.mock('./Form/SearchInput');

describe('Header component', () => {
    const setAuthMock = jest.fn();
    const renderComponent = () => {
        render (
            <Router>
                <Header/>
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

    test('renders correctly when user is not logged in', () => {
        renderComponent();

        expect(screen.getByText('Register')).toBeInTheDocument();
        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByText('Cart')).toBeInTheDocument();
        expect(screen.getByText('Cart').closest('span')).toHaveTextContent(0);
    });

    test('renders correctly when user is logged in', () => {
        useAuth.mockReturnValue([{ 
            user: { name: 'test-user', role: 0 }, 
            token: 'test-token', 
            setAuthMock
        }]);

        renderComponent();

        expect(screen.getByText('test-user')).toBeInTheDocument();
        expect(screen.getByText('Logout')).toBeInTheDocument();
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
});