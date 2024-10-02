import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserMenu from './UserMenu';

describe('UserMenu Component', () => {
    // Wrap component in BrowserRouter to allow NavLink to function
    const renderWithRouter = (component) => {
        return render(<BrowserRouter>{component}</BrowserRouter>);
    };

    it('renders the UserMenu component', () => {
        renderWithRouter(<UserMenu />);
        // /Dashboard/i is a regex to match the text "Dashboard" case-insensitive
        const dashboard = screen.getByText(/dashboard/i);
        const profileLink = screen.getByRole('link', { name: /profile/i });
        const ordersLink = screen.getByRole('link', { name: /orders/i });

        expect(dashboard).toBeInTheDocument();
        expect(profileLink).toBeInTheDocument();
        expect(ordersLink).toBeInTheDocument();
        expect(profileLink).toHaveAttribute('href', '/dashboard/user/profile');
        expect(ordersLink).toHaveAttribute('href', '/dashboard/user/orders');
    });
});