// @ts-nocheck
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom"; // Import MemoryRouter for testing
import CategoryProduct from "./CategoryProduct";
import Layout from "./../components/Layout";
import {
	useParams,
	useNavigate,
	Router,
	Routes,
	Route,
} from "react-router-dom";
import "../styles/ProductDetailsStyles.css";
const axios = require("axios");
import "@testing-library/jest-dom/extend-expect";

// Mock axios for API requests
jest.mock("axios");

// Mock the Layout component
jest.mock("./../components/Layout", () => ({ children }) => (
	<div>{children}</div>
));

// Mock useNavigate
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"), 
	useParams: jest.fn(), 
	useNavigate: () => mockNavigate,
}));

const productsData = [
	{
		_id: "1",
		name: "Product 1",
		price: 100,
		description: "Description for product 1",
		slug: "product-1",
	},
	{
		_id: "2",
		name: "Product 2",
		price: 200,
		description: "Description for product 2",
		slug: "product-2",
	},
];

const categoryData = {
	name: "Electronics",
};


describe("CategoryProduct Component", () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	test("renders product details correctly non-empty similar product", async () => {
		axios.get.mockImplementation((url) => {
			if (url === "/api/v1/product/product-category/slug") {
				return Promise.resolve({
					data :  {
                        products: productsData,
                        category: categoryData,
                      },
				});
			} 
			return Promise.reject(new Error("Not Found"));
		});

		const getSpy = jest.spyOn(axios, "get");

		require("react-router-dom").useParams.mockReturnValue({
			slug: "slug",
		}); 

		render(
			<MemoryRouter initialEntries={[`/category/slug`]}>
				<Routes>
					<Route
						path="/category/slug"
						element={<CategoryProduct />}
					/>
				</Routes>
			</MemoryRouter>
		);

		// Wait for category name to be displayed
        expect(await screen.findByText(/Category - Electronics/i)).toBeInTheDocument();

        expect(screen.getByText(/Product 1/)).toBeInTheDocument();
        expect(screen.getByText(/Product 2/)).toBeInTheDocument();
    
        // Check if prices are rendered correctly
        expect(screen.getByText(/\$100\.00/)).toBeInTheDocument();
        expect(screen.getByText(/\$200\.00/)).toBeInTheDocument();
    
        // Check number of products rendered
        expect(screen.getByText(/2 result found/i)).toBeInTheDocument();

        const moreDetailsButtons = await screen.findAllByText(/More Details/i);
        expect(moreDetailsButtons).toHaveLength(2);
        // Simulate a click on the first "More Details" button
        fireEvent.click(moreDetailsButtons[0]);
        // Verify that the first button navigates to the correct product URL
        expect(mockNavigate).toHaveBeenCalledWith('/product/product-1');

        // Simulate a click on the second "More Details" button
        fireEvent.click(moreDetailsButtons[1]);
        // Verify that the second button navigates to the correct product URL
        expect(mockNavigate).toHaveBeenCalledWith('/product/product-2');
	});


    test("renders category product empty array", async () => {
		axios.get.mockImplementation((url) => {
			if (url === "/api/v1/product/product-category/slug") {
				return Promise.resolve({
					data :  {
                        products: [],
                        category: {},
                      },
				});
			} 
			return Promise.reject(new Error("Not Found"));
		});

		// Spy on axios.get and mock its resolved value
		const getSpy = jest.spyOn(axios, "get");

		require("react-router-dom").useParams.mockReturnValue({
			slug: "slug",
		}); 

		render(
			<MemoryRouter initialEntries={[`/category/slug`]}>
				<Routes>
					<Route
						path="/category/slug"
						element={<CategoryProduct />}
					/>
				</Routes>
			</MemoryRouter>
		);

        expect(await screen.findByText(/Category -/i)).toBeInTheDocument();

        expect(screen.getByText(/0 result found/i)).toBeInTheDocument();
	});
});
