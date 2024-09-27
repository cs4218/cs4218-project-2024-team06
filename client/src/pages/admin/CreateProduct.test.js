import '@testing-library/jest-dom';
import React from "react";
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect } from '@jest/globals';
import CreateProduct from "./CreateProduct";
import { BrowserRouter} from "react-router-dom";

const defaultComponent = () => {
    render(<BrowserRouter>
        <CreateProduct/>
    </BrowserRouter>)};

describe("Given a default component is created", () => {
    // ARRANGE
    beforeEach(defaultComponent);
    describe("When the component is rendered", () => {
        // ACT
        test("The different components are rendered", () => {
            // ASSERT
            expect(screen.getByTitle("Dashboard - Create Product")).toBeInTheDocument(); // admin menu
            expect(screen.getByPlaceholderText("Select a category")).toBeInTheDocument(); // select category 
            expect(screen.getByPlaceholderText("Select Shipping ")).toBeInTheDocument(); // select shipping 
            expect(screen.getByPlaceholderText("write a quantity")).toBeInTheDocument(); // quantity input
            expect(screen.getByPlaceholderText("write a Price")).toBeInTheDocument(); // price input
            expect(screen.getByPlaceholderText("write a description")).toBeInTheDocument(); // description input
            expect(screen.getByPlaceholderText("write a name")).toBeInTheDocument(); // name input
            expect(screen.getByRole("img")).toBeInTheDocument(); // image display
            expect(screen.getByText('CREATE PRODUCT')).toBeInTheDocument(); // button

        });
    })
})