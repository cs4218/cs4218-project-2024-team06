import '@testing-library/jest-dom';
import Dashboard from './Dashboard';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { useAuth } from '../../context/auth';

jest.mock('../../context/auth', () => ({
    useAuth: jest.fn()
}));

jest.mock('../../components/Layout', () => ({ children }) => <div>{children}</div>);
jest.mock('../../components/UserMenu', () => () => <div>User Menu</div>);
const name = "Halimah Yacob";
const email = "yacob@gov.sg";
const address = "Istana";

describe('Dashboard', () => {
    beforeEach(() => {
        useAuth.mockReturnValue([{
            user: { name, email, address }},
        ]);
    });

    it("should render the user information", () => {
        render(<Dashboard />);
        
        expect(screen.getByText("User Menu")).toBeInTheDocument();
        expect(screen.getByText(name)).toBeInTheDocument();
        expect(screen.getByText(email)).toBeInTheDocument();
        expect(screen.getByText(address)).toBeInTheDocument();
    });

    it("should not render user information", () => {
        useAuth.mockReturnValue([null]);
        render(<Dashboard />);
        expect(screen.queryByText(name)).not.toBeInTheDocument();
        expect(screen.queryByText(email)).not.toBeInTheDocument();
        expect(screen.queryByText(address)).not.toBeInTheDocument();
    });

    it("should not render user information for auth.user is null", () => {
        useAuth.mockReturnValue([{ user: null }]);
        render(<Dashboard />);
        expect(screen.queryByText(name)).not.toBeInTheDocument();
        expect(screen.queryByText(email)).not.toBeInTheDocument();
        expect(screen.queryByText(address)).not.toBeInTheDocument();
    });

    it("should not render user information for null fields", () => {
        useAuth.mockReturnValue([{ user: { name: null, email: null, address: null } }]);
        render(<Dashboard />);
        expect(screen.queryByText(name)).not.toBeInTheDocument();
        expect(screen.queryByText(email)).not.toBeInTheDocument();
        expect(screen.queryByText(address)).not.toBeInTheDocument();
    });
});