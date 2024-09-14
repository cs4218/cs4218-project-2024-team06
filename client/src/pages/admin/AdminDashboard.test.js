// AdminDashboard.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import { useAuth } from '../../context/auth';
import '@testing-library/jest-dom/extend-expect';

// Mock the external components that AdmiNDashboard uses
jest.mock('../../components/AdminMenu', () => () => <div>Mocked AdminMenu</div>);
jest.mock('./../../components/Layout', () => ({ children }) => <div><h1>Mocked Layout</h1><div>{ children }</div></div>);


// Mock the useAuth hook
jest.mock('../../context/auth', () => ({
    useAuth: jest.fn(),
}));


describe('AdminDashboard Component', () => {
   
    beforeEach(() => {
        jest.clearAllMocks();
    });


    describe("should correctly render the mocked components", () => {
        beforeEach(() => {
            useAuth.mockReturnValue([]);
        });

        it('AdminMenu', () => {
            //ARRANGE

            //ACTION
            render(
            <MemoryRouter initialEntries={['/dashboard/admin']}>
                <Routes>
                <Route path='/dashboard/admin' element={<AdminDashboard />} />
                </Routes>
            </MemoryRouter>
            );
    
            //ASSERT
            expect(screen.getByText("Mocked AdminMenu")).toBeInTheDocument();
        });


        it('Layout', () => {
            //ARRANGE

            //ACTION
            render(
            <MemoryRouter initialEntries={['/dashboard/admin']}>
                <Routes>
                <Route path='/dashboard/admin' element={<AdminDashboard />} />
                </Routes>
            </MemoryRouter>
            );
    
            //ASSERT
            expect(screen.getByText("Mocked Layout")).toBeInTheDocument();
        });
    });


    
describe('AdminDashboard Component', () => {
   
    beforeEach(() => {
        jest.clearAllMocks();
    });


    describe("should correctly render the mocked components", () => {
        beforeEach(() => {
            useAuth.mockReturnValue([]);
        });

        it('AdminMenu', () => {
            //ARRANGE

            //ACTION
            render(
            <MemoryRouter initialEntries={['/dashboard/admin']}>
                <Routes>
                <Route path='/dashboard/admin' element={<AdminDashboard />} />
                </Routes>
            </MemoryRouter>
            );
    
            //ASSERT
            expect(screen.getByText("Mocked AdminMenu")).toBeInTheDocument();
        });


        it('Layout', () => {
            //ARRANGE

            //ACTION
            render(
            <MemoryRouter initialEntries={['/dashboard/admin']}>
                <Routes>
                <Route path='/dashboard/admin' element={<AdminDashboard />} />
                </Routes>
            </MemoryRouter>
            );
    
            //ASSERT
            expect(screen.getByText("Mocked Layout")).toBeInTheDocument();
        });
    });


    describe("should correctly render admin details", () => {
        it('where name, email and contact are empty if useAuth did not return any information', () => {
            //ARRANGE
            useAuth.mockReturnValue([]);

            //ACTION
            render(
            <MemoryRouter initialEntries={['/dashboard/admin']}>
                <Routes>
                <Route path='/dashboard/admin' element={<AdminDashboard />} />
                </Routes>
            </MemoryRouter>
            );
    
            //ASSERT
            screen.debug();
            expect(screen.getByText("Admin Name :")).toBeInTheDocument();
            //expect(screen.getByText(/Admin Name :/)).toBeInTheDocument();
            // expect(screen.getByText("Admin Email : ")).toBeInTheDocument();
            // expect(screen.getByText("Admin Contact : ")).toBeInTheDocument();
        });
    });



});

});
