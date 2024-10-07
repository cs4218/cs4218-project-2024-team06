// @ts-nocheck
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; 
import { useSearch } from '../context/search'; 
import { SearchProvider } from '../context/search';
import Search from './Search'; 
import { Router, MemoryRouter } from 'react-router-dom';

// Mock the Layout component
jest.mock("./../components/Layout", () => ({ children }) => (
	<div>{children}</div>
));

jest.mock('../context/search', () => ({
    useSearch: jest.fn()
}));


describe('Search Component', () => {
    let mockSearch;
    const setupMocks = () => {
        useSearch.mockReturnValue([mockSearch, jest.fn()]);
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockSearch = [];
        setupMocks();
    });

  // Test case for rendering without any search results
  test('renders no products found message when there are no results', () => {
    const mockResults = [];
      const setSearchMock = jest.fn();
      setupMocks();
  
      useSearch.mockReturnValue([{results:mockResults}, setSearchMock]);
    render(
        <MemoryRouter initialEntries={['/search']}>
            <Search />
        </MemoryRouter>
    );

    expect(screen.getByText('No Products Found')).toBeInTheDocument();
    expect(screen.getByText('Search Resuts')).toBeInTheDocument(); // Check title
  });

  // Test case for rendering with search results
  test('renders search results correctly', () => {
    const mockResults = [
      {
        _id: '1',
        name: 'Product 1',
        description: 'Description of product 1',
        price: 100,
      },
      {
        _id: '2',
        name: 'Product 2',
        description: 'Description of product 2',
        price: 200,
      },
    ];
    const setSearchMock = jest.fn();
    setupMocks();

    useSearch.mockReturnValue([{results:mockResults}, setSearchMock]);

    const { rerender } = render(
        <MemoryRouter initialEntries={['/search']}>
            <Search />
        </MemoryRouter>
    );
    

    expect(screen.getByText('Found 2')).toBeInTheDocument();
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Description of product 1...')).toBeInTheDocument();
    expect(screen.getByText('$ 100')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('Description of product 2...')).toBeInTheDocument();
    expect(screen.getByText('$ 200')).toBeInTheDocument();
  });
});
