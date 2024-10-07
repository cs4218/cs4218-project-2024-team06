import '@testing-library/jest-dom';
import axios from 'axios';
import { Outlet } from 'react-router-dom';
import PrivateRoute from './Private';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Spinner from "../Spinner";
import { useAuth } from '../../context/auth';

jest.mock('../../context/auth', () => ({
    useAuth: jest.fn()
}));

const mockAuth = { token: 'sample token' };

jest.mock('axios');

jest.mock('react-router-dom', () => ({
    Outlet: () => <div>Mocked Outlet</div>
}));

jest.mock('../Spinner', () => 
    () => <div>Mocked Spinner</div>
);

const apiString = "/api/v1/auth/user-auth";

describe('PrivateRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render Spinner if no auth token', async () => {
        useAuth.mockReturnValue([null, jest.fn()]);
        render(<PrivateRoute />);
        expect(await screen.findByText('Mocked Spinner')).toBeInTheDocument();
        expect(axios.get).not.toHaveBeenCalled();
    });
    
    it('should render Outlet if axios reports valid token', async () => {
        useAuth.mockReturnValue([mockAuth, jest.fn()]);
        const res = { data: { ok: true } };
        axios.get.mockResolvedValue(res);
        render(<PrivateRoute />);
        expect(await screen.findByText('Mocked Outlet')).toBeInTheDocument();
        expect(axios.get).toHaveBeenCalledWith(apiString);
    });

    it('should render Spinner if axios reports invalid token', async () => {
        useAuth.mockReturnValue([mockAuth, jest.fn()]);
        const res = { data: { ok: false } };
        axios.get.mockResolvedValue(res);
        render(<PrivateRoute />);
        expect(await screen.findByText('Mocked Spinner')).toBeInTheDocument();
        expect(axios.get).toHaveBeenCalledWith(apiString);
    });
});