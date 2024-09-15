import '@testing-library/jest-dom';
import axios from 'axios';
import { Outlet } from 'react-router-dom';
import PrivateRoute from './Private';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Spinner from "../Spinner";
import { useAuth } from '../../context/auth';
import { waitFor } from '@testing-library/react';
import { clear } from 'console';

jest.mock('../../context/auth', () => ({
    useAuth: jest.fn()
}));

jest.mock('mongoose', () => ({
    connect: jest.fn(),
    model: jest.fn(),
    Schema: jest.fn(),
}));

// Sample token for testing
const mockAuth = { token: 'sample token' };

jest.mock('axios');

jest.mock('react-router-dom', () => ({
    Outlet: () => <div>Mocked Outlet</div>
}));

jest.mock('../Spinner', () => 
    () => <div>Mocked Spinner</div>
);

describe('PrivateRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render Spinner if no auth token', async () => {
        useAuth.mockReturnValue([null, jest.fn()]);
        render(<PrivateRoute />);
        expect(await screen.findByText('Mocked Spinner')).toBeInTheDocument();
    });
    
    it('should render Outlet if axios reports valid token', async () => {
        useAuth.mockReturnValue([mockAuth, jest.fn()]);
        const res = { data: { ok: true } };
        axios.get.mockResolvedValue(res);
        render(<PrivateRoute />);
        expect(await screen.findByText('Mocked Outlet')).toBeInTheDocument();
    });

    it('should render Spinner if axios reports invalid token', async () => {
        useAuth.mockReturnValue([mockAuth, jest.fn()]);
        const res = { data: { ok: false } };
        axios.get.mockResolvedValue(res);
        render(<PrivateRoute />);
        expect(await screen.findByText('Mocked Spinner')).toBeInTheDocument();
    });

    it('should render Spinner if axios request fails', async () => {
        useAuth.mockReturnValue([mockAuth, jest.fn()]);
        axios.get.mockRejectedValue(new Error('arghhh'));
        render(<PrivateRoute />);
        expect(await screen.findByText('Mocked Spinner')).toBeInTheDocument();
    });
});