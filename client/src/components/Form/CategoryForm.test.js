import '@testing-library/jest-dom';
import React from "react";
import CategoryForm from "./CategoryForm";
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect } from '@jest/globals';

const mockSetValue = jest.fn();
const mockHandleSubmit = jest.fn();

const emptyComponent = () => {render(<CategoryForm/>)};
const filledComponent = () => {render(<CategoryForm value={"test-value"} setValue={mockSetValue} handleSubmit={mockHandleSubmit}/>)};

describe("Given a default component is created", () => {
    // ARRANGE
    beforeEach(emptyComponent);
    describe("When the component is rendered", () => {
        // ACT
        test("Then text box and search button render with default attributes", () => {
            // ASSERT
            expect(screen.getByRole('textbox')).toBeInTheDocument();
            expect(screen.getByRole('textbox')).toHaveProperty('placeholder', "Enter new category");
            expect(screen.getByText('Submit')).toBeInTheDocument();
        });
    })
})

describe("Given a component with custom values is created", () => {
    
    // ARRANGE
    beforeEach(filledComponent);

    describe("When the component is rendered", () => {
        // ACT
        test("Then text box and search button render with correct attributes", () => {
            // ASSERT
            expect(screen.getByRole('textbox')).toBeInTheDocument();
            expect(screen.getByRole('textbox')).toHaveProperty('placeholder', "Enter new category");
            expect(screen.getByRole('textbox')).toHaveProperty('value', "test-value");
            expect(screen.getByText('Submit')).toBeInTheDocument();
        });
    })

    describe("When the user types in values", () => {

        // GENERAL ARRANGE
        expect(mockSetValue).toHaveBeenCalledTimes(0);
        
        test("Then value of text box changes and setValue fires accordingly", () => {
            // ACT
            userEvent.clear(screen.getByRole('textbox'));
            userEvent.type(screen.getByRole('textbox'), "text"); 
            // ASSERT
            expect(mockSetValue).toHaveBeenCalledTimes(5); //4 char + 1 removal
        });
    })


    describe("When the user submits the form", () => {
        // ARRANGE
        expect(mockHandleSubmit).toHaveBeenCalledTimes(0);
        test("Then the handleSubmit function fires once", () => {
            // ACT
            userEvent.click(screen.getByText("Submit"));
            // ASSERT
            expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
        });
    })

})