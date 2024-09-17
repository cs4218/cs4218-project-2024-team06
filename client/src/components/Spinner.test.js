import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useNavigate, useLocation } from "react-router-dom";
import Spinner from './Spinner';
import '@testing-library/jest-dom/extend-expect';

// Mock useNavigate and useLocation
const mockNavigate = jest.fn();
const mockLocation = { pathname: '/current-path' };

jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
}));

const advanceTimers = (ms) => {
    act(() => {
        jest.advanceTimersByTime(ms);
    })
};

describe('Spinner Componenet', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    test('should render spinner with countdown', () => {
        render(<Spinner/>);

        expect(screen.getByText('redirecting you in 3 seconds')).toBeInTheDocument();
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('should count down and navigate after 3 seconds', () => {
        render(<Spinner/>);

        expect(screen.getByText('redirecting you in 3 seconds')).toBeInTheDocument();
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        advanceTimers(1000);
        expect(screen.getByText('redirecting you in 2 seconds')).toBeInTheDocument();
        
        advanceTimers(1000);
        expect(screen.getByText('redirecting you in 1 second')).toBeInTheDocument();

        advanceTimers(1000);
        expect(mockNavigate).toHaveBeenCalledWith('/login', {
            state: '/current-path'
        })
        expect(screen.getByText('redirecting you in 0 second')).toBeInTheDocument();
    })
});