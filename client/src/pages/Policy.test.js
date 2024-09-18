// @ts-nocheck
import React from "react";
import { render, screen } from "@testing-library/react";
import Policy from "./Policy";
import '@testing-library/jest-dom/extend-expect'; 

// Mocking Layout Component
jest.mock("./../components/Layout", () => ({ children, title }) => (
  <div>
    <h1>{title}</h1>
    {children}
  </div>
));

describe('Policy Component', () => {
  test('should render the Privacy Policy page correctly', () => {
    render(<Policy />);
    
    // Assert that the Layout title is correct
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    
    // Assert that the privacy policy content is rendered multiple times (7)
    const privacyPolicies = screen.getAllByText("add privacy policy");
    expect(privacyPolicies.length).toBe(7); 
    
    // Ensure the image is present
    const image = screen.getByAltText("contactus");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/contactus.jpeg');
  });
});
