// @ts-nocheck
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom"; // Import MemoryRouter for testing
import ProductDetails from "./ProductDetails";
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
import { createMemoryHistory } from "history";


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


const mockProduct = {
	_id: "1",
	name: "Test Product",
	description: "This is a test product",
	price: 100,
	category: { name: "Test Category" },
};

describe("ProductDetails Component", () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	test("renders product details correctly non-empty similar product", async () => {
		const mockProduct = {
			_id: "1",
			name: "Test Product",
			description: "Test Description",
			price: 100,
			category: {
				_id: "2", 
				name: "Test Category",
			},
		};

		const mockRelatedProducts = [
			{
				_id: "2",
				name: "Similar Product 1",
				price: 90,
				description: "Similar product description 1.",
				slug: "similar-product-1",
			},
			{
				_id: "3",
				name: "Similar Product 2",
				price: 80,
				description: "Similar product description 2.",
				slug: "similar-product-2",
			},
		];

      
        
		axios.get.mockImplementation((url) => {
			if (url === "/api/v1/product/get-product/testproduct") {
				return Promise.resolve({
					data: { product: mockProduct },
				});
			} else if (url === "/api/v1/product/related-product/1/2") {
				return Promise.resolve({
					data: { products: mockRelatedProducts },
				});
			}
			return Promise.reject(new Error("Not Found"));
		});

		// Spy on axios.get and mock its resolved value
		const getSpy = jest.spyOn(axios, "get");

		require("react-router-dom").useParams.mockReturnValue({
			slug: "testproduct",
		}); 

		render(
			<MemoryRouter initialEntries={[`/product/testproduct`]}>
				<Routes>
					<Route
						path="/product/testproduct"
						element={<ProductDetails />}
					/>
				</Routes>
			</MemoryRouter>
		);

		expect(await screen.findByText("Product Details")).toBeInTheDocument();
		expect(
			await screen.findByText(/Name : Test Product/i)
		).toBeInTheDocument();
		expect(await screen.findByText(/Description : Test Description/i)).toBeInTheDocument();
		expect(await screen.findByText(/Price :/i)).toBeInTheDocument();
		expect(await screen.findByText(/\$100.00/i)).toBeInTheDocument();
		expect(await screen.findByText(/Category : Test Category/i)).toBeInTheDocument();
		
        expect(await screen.findByText(/ADD TO CART/i)).toBeInTheDocument();

        expect(await screen.findByText(/Similar Products/i)).toBeInTheDocument();
        expect(await screen.findByText(/Similar Product 1/i)).toBeInTheDocument();
		expect(await screen.findByText(/\$90.00/i)).toBeInTheDocument();
		expect(await screen.findByText(/Similar product description 1..../i)).toBeInTheDocument();

        
        expect(await screen.findByText(/Similar Product 2/i)).toBeInTheDocument();
		expect(await screen.findByText(/\$80.00/i)).toBeInTheDocument();
		expect(await screen.findByText(/Similar product description 2..../i)).toBeInTheDocument();
        
        const moreDetailsButtons = await screen.findAllByText(/More Details/i);
        expect(moreDetailsButtons).toHaveLength(2);
        // Simulate a click on the first "More Details" button
        fireEvent.click(moreDetailsButtons[0]);
        // Verify that the first button navigates to the correct product URL
        expect(mockNavigate).toHaveBeenCalledWith('/product/similar-product-1');

        // Simulate a click on the second "More Details" button
        fireEvent.click(moreDetailsButtons[1]);
        // Verify that the second button navigates to the correct product URL
        expect(mockNavigate).toHaveBeenCalledWith('/product/similar-product-2');
        // Verify axios.get was called with the correct URL
		expect(getSpy).toHaveBeenCalledWith("/api/v1/product/get-product/testproduct");
	});


    test("renders product details correctly but similar product empty", async () => {
		const mockProduct = {
			_id: "1",
			name: "Test Product",
			description: "Test Description",
			price: 100,
			category: {
				_id: "2", 
				name: "Test Category",
			},
		};
      
        
		axios.get.mockImplementation((url) => {
			if (url === "/api/v1/product/get-product/testproduct") {
				return Promise.resolve({
					data: { product: mockProduct },
				});
			} else if (url === "/api/v1/product/related-product/1/2") {
				return Promise.resolve({
					data: { products: [] },
				});
			}
			return Promise.reject(new Error("Not Found"));
		});

		// Spy on axios.get and mock its resolved value
		const getSpy = jest.spyOn(axios, "get");

		require("react-router-dom").useParams.mockReturnValue({
			slug: "testproduct",
		}); 

		render(
			<MemoryRouter initialEntries={[`/product/testproduct`]}>
				<Routes>
					<Route
						path="/product/testproduct"
						element={<ProductDetails />}
					/>
				</Routes>
			</MemoryRouter>
		);

		expect(await screen.findByText(/Product Details/i)).toBeInTheDocument();
		expect(
			await screen.findByText(/Name : Test Product/i)
		).toBeInTheDocument();
		expect(await screen.findByText(/Description : Test Description/i)).toBeInTheDocument();
		expect(await screen.findByText(/Price :/i)).toBeInTheDocument();
		expect(await screen.findByText(/\$100.00/i)).toBeInTheDocument();
		expect(await screen.findByText(/Category : Test Category/i)).toBeInTheDocument();
		
        expect(await screen.findByText(/ADD TO CART/i)).toBeInTheDocument();

        expect(await screen.findByText(/Similar Products ➡️/i)).toBeInTheDocument();
        expect(await screen.queryByText(/Similar Product 1/i)).not.toBeInTheDocument();
		expect(await screen.queryByText(/\$90.00/i)).not.toBeInTheDocument();
		expect(await screen.queryByText(/Similar product description 1..../i)).not.toBeInTheDocument();

        
        expect(await screen.queryByText(/Similar Product 2/i)).not.toBeInTheDocument();
		expect(await screen.queryByText(/\$80.00/i)).not.toBeInTheDocument();
		expect(await screen.queryByText(/Similar product description 2..../i)).not.toBeInTheDocument();
        
        expect(await screen.findByText(/No Similar Products found/i)).toBeInTheDocument();
		expect(getSpy).toHaveBeenCalledWith("/api/v1/product/get-product/testproduct");
	});
});
