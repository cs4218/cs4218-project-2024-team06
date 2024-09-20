import React from "react";
import axios from "axios";
import useCategory from "./useCategory";
import { renderHook, waitFor } from "@testing-library/react";

jest.mock('axios');

const mockCategory = [
    { _id: 1, name: 'Electronics', slug: 'ElectronicsSlug' },
    { _id: 2, name: 'Books', slug: 'BooksSlug' },
];

describe('useCategory', () => {
    test('should get categories correctly', async () => {
        axios.get.mockResolvedValue({ data: {category: mockCategory } });
        const { result } = renderHook(() => useCategory());
        
        // Wait for the hook to update after the API call
        await waitFor(() => {
            expect(result.current).toEqual(mockCategory);
        });
    });

    test('Should log error on API failure', async () => {
        const error = new Error('API failure');
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        axios.get.mockRejectedValue(error);

        renderHook(() => useCategory());
        await waitFor(() => {
            expect(consoleLogSpy).toHaveBeenCalledWith(error);
        });
    });
});