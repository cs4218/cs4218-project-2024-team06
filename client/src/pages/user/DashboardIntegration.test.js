/**
 * Dashboard.js uses useAuth(), the Layout.js and UserMenu.js. The objective of this integration 
 * test is to test if Dashboard.js is able to work with these 3 things.
 * 
 * However, the Layout component calls on 2 children components Header.js and Footer.js, of which 
 * the former calls uses useCart(), useCategory() and SearchInput.js. SearchInput.js in turn uses 
 * useSearch and useNavigate. Since the integration test is only concerned with the integration 
 * between Dashboard.js, useAuth(), Layout.js and UserMenu.js, the integration test should not be 
 * concerned with the functionality of these other components.
 */

import '@testing-library/jest-dom';
import { AuthProvider } from '../../context/auth';
import { CartProvider } from '../../context/cart';
import Dashboard from './Dashboard';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { SearchProvider } from '../../context/search';

const mockAuthData = JSON.stringify({
    user: { name: 'Halimah Yacob', email: 'halimah@gov.sg', address: 'Istana', role: 0 },
    token: 'fakeToken',
});

describe('Dashboard Integration Test with AuthProvider', () => {
    beforeEach(() => {
        localStorage.setItem('auth', mockAuthData);
    });

    afterEach(() => {
        localStorage.removeItem('auth');
    });

    it('should integrate with useAuth, Layout.js and UserMenu.js', () => {
        render(
            <AuthProvider>
                <CartProvider>
                    <SearchProvider>
                        <MemoryRouter>
                            <Dashboard />
                        </MemoryRouter>
                    </SearchProvider>
                </CartProvider>
            </AuthProvider>
        );
        
        // Header.js
        expect(screen.getByText('🛒 Virtual Vault')).toBeInTheDocument();
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Categories')).toBeInTheDocument();
        expect(screen.getByText('All Categories')).toBeInTheDocument();
        expect(screen.queryByText('Register')).not.toBeInTheDocument();
        expect(screen.queryByText('Login')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Halimah Yacob' })).toBeInTheDocument();
        const dashboardNavLink = screen.getByRole('link', { name: /dashboard/i });
        expect(dashboardNavLink).toHaveAttribute('href', '/dashboard/user');
        expect(screen.getByText('Logout')).toBeInTheDocument();
        expect(screen.getByText('Cart')).toBeInTheDocument();
        
        // SearchInput.js
        expect(screen.getByText('Search')).toBeInTheDocument();

        // UserMenu.js
        const dashboardHeader = screen.getByRole('heading', { name: /dashboard/i });
        expect(dashboardHeader).toBeInTheDocument();
        const profileNavLink = screen.getByRole('link', { name: /profile/i });
        expect(profileNavLink).toHaveAttribute('href', '/dashboard/user/profile');
        const ordersNavLink = screen.getByRole('link', { name: /orders/i });
        expect(ordersNavLink).toHaveAttribute('href', '/dashboard/user/orders');

        // useAuth()
        expect(screen.getByRole('heading', { name: 'Halimah Yacob' })).toBeInTheDocument();
        expect(screen.getByText('halimah@gov.sg')).toBeInTheDocument();
        expect(screen.getByText('Istana')).toBeInTheDocument();
        
        // Footer.js
        expect(screen.getByText('About')).toBeInTheDocument();
        const aboutNavLink = screen.getByRole('link', { name: /about/i });
        const contactNavLink = screen.getByRole('link', { name: /contact/i });
        const privacyNavLink = screen.getByRole('link', { name: /privacy policy/i });
        expect(aboutNavLink).toHaveAttribute('href', '/about');
        expect(contactNavLink).toHaveAttribute('href', '/contact');
        expect(privacyNavLink).toHaveAttribute('href', '/policy');        
    });
});