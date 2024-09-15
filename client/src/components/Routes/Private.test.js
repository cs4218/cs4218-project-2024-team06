import '@testing-library/jest-dom';
import axios from 'axios';
import { Outlet } from 'react-router-dom';
import PrivateRoute from './Private';
import React from 'react';
import { findByTestId, findByText, render, screen } from '@testing-library/react';
import Spinner from "../Spinner";
import { useAuth } from '../../context/auth';

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
    it('should render Spinner if no auth token', () => {
        useAuth.mockReturnValue([null, jest.fn()]);
        render(<PrivateRoute />);
        expect(screen.getByText('Mocked Spinner')).toBeInTheDocument();
    });
    
    it('should render Outlet if auth token is valid', async () => {
        useAuth.mockReturnValue([mockAuth, jest.fn()]);
        const res = { data: { ok: true } };
        axios.get.mockResolvedValue(res);
        render(<PrivateRoute />);
        expect(await screen.findByText('Mocked Outlet')).toBeInTheDocument();
    });

    it('should render Spinner if auth token is invalid', () => {
        useAuth.mockReturnValue([mockAuth, jest.fn()]);
        const res = { data: { ok: false } };
        axios.get.mockResolvedValue(res);
        render(<PrivateRoute />);
        expect(screen.getByText('Mocked Spinner')).toBeInTheDocument();
    });

    // it('should render Spinner if axios request fails', () => {
    //     useAuth.mockReturnValue([mockAuth, jest.fn()]);
    //     axios.get.mockRejectedValue(new Error('Async error'));
    // });
});