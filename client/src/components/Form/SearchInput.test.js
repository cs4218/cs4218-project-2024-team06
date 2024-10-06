// @ts-nocheck
import { render, screen, fireEvent } from "@testing-library/react";
import axios from "axios";
import SearchInput from "./SearchInput";
import { useSearch } from "../../context/search"; // Mock useSearch
import { MemoryRouter } from "react-router-dom"; // To test navigation
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

// Mock axios
jest.mock("axios");

//Mock useSearch hook
const mockSetValues = jest.fn();
jest.mock("../../context/search", () => ({
	useSearch: jest.fn(),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"),
	useNavigate: () => mockNavigate,
}));

describe("SearchInput Component", () => {
	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks();

		// Mock the initial values from useSearch
		useSearch.mockReturnValue([
			{ keyword: "", results: [] },
			mockSetValues,
		]);
	});

	test("renders the search input and button correctly and able to search", () => {
		const mockSearchResults = { data: [] };
		axios.get.mockResolvedValueOnce(mockSearchResults);
		render(
			<MemoryRouter>
				<SearchInput />
			</MemoryRouter>
		);

		// Check if the search input is rendered
		expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
		// Check if the search button is rendered
		expect(
			screen.getByRole("button", { name: /search/i })
		).toBeInTheDocument();

		const searchInput = screen.getByPlaceholderText(/Search/i);
		const searchButton = screen.getByRole("button", { name: /search/i });

        fireEvent.change(searchInput, { target: { value: "test keyword" } });
		userEvent.click(searchButton);

        //shows form is submitted
        expect(axios.get).toHaveBeenCalledTimes(1);
		// Expect setValues to be called with the updated keyword
		expect(mockSetValues).toHaveBeenCalledWith({
			keyword: "test keyword",
			results: [], 
		});
	});
});
