import React from 'react';
import { render, screen} from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CreateCategory from './CreateCategory';
import '@testing-library/jest-dom/extend-expect';

//Mock components
jest.mock('../../components/AdminMenu', () => () => <div>Admin Menu Mock</div>);
jest.mock('./../../components/Layout', () => ({ children }) => <div><h1>Dashboard Mock</h1><div>{ children }</div></div>);
jest.mock('./../../components/Form/CategoryForm', () => () => <div>Category Form Mock</div>);


describe("Create Category Component", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Mock data
    const mockValidCategories = [
        { _id: 1, name: 'dresses', slug: 'dresses' },
        { _id: 2, name: 'shoes', slug: 'shoes' },
    ];

    //Mock toast
    jest.mock('react-hot-toast', () => ({
        toast: {
            error: jest.fn(), 
        },
    }));

    //Mock axios calls

    //successfull category fetch
    jest.mock('axios', () => ({
        get: jest.fn(() => Promise.resolve({
            data: {
            success: true,
            category: mockValidCategories,
            },
        })),
    }));


    //failed update
    jest.mock('axios', () => ({
        put: jest.fn((id, name) => Promise.resolve({
            data: {
            success: false,
            message: "Update Error",
            },
        })),
    }));

    //successfull submit
    jest.mock('axios', () => ({
        post: jest.fn((name) => Promise.resolve({
            data: {
            success: true,
            },
        })),
    }));

    //successfull delete
    jest.mock('axios', () => ({
        delete: jest.fn((id) => Promise.resolve({
            data: {
            success: true,
            },
        })),
    }));

    describe("When the component is rendered", () => {
        
        test("The components are rendered correctly", () => {

            //ARRANGE
            render(
                <MemoryRouter initialEntries={['/dashboard/admin/create-category']}>
                    <Routes>
                    <Route path='/dashboard/admin/create-category' element={<CreateCategory />} />
                    </Routes>
                </MemoryRouter>
                );

        
            // ASSERT (always fails due to inconsistent capitalisation in original code)
            expect(screen.getByText(/Dashboard Mock/)).toBeInTheDocument(); 
            expect(screen.getByText(/Admin Menu Mock/)).toBeInTheDocument();
            expect(screen.getByText(/Category Form Mock/)).toBeInTheDocument();
        });
    })
})