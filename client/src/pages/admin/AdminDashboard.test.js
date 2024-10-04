import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import { useAuth } from '../../context/auth';
import '@testing-library/jest-dom/extend-expect';

// Mock the external components that AdminDashboard uses
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


    describe("should correctly render the components with admin details", () => {
        beforeEach(() => {
            useAuth.mockReturnValue([{
                user: {
                    name: "Admin",
                    email: "admin@gmail.com",
                    phone: "91234567"
                }
            }]);
        });

        it('AdminMenu and Layout', () => {
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
            expect(screen.getByText("Mocked Layout")).toBeInTheDocument();
            expect(screen.getByText("Admin Name : Admin")).toBeInTheDocument();
            expect(screen.getByText("Admin Email : admin@gmail.com")).toBeInTheDocument();
            expect(screen.getByText("Admin Contact : 91234567")).toBeInTheDocument();
        });
    });
});
