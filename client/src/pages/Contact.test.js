// @ts-nocheck
import React from "react";
import { render, screen } from "@testing-library/react";
import Contact from "./Contact";
import '@testing-library/jest-dom/extend-expect';

// Mocking Layout Component
jest.mock("./../components/Layout", () => ({ children, title }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ));

describe('Contact Component', () => {
  test('should render the Contact Us page correctly', () => {
    // Render the Contact component
    render(<Contact />);
    
    // Assert that the Layout title is correct
    expect(screen.getByText("Contact us")).toBeInTheDocument();

    // Assert that the header (h1) is correct
    expect(screen.getByText("CONTACT US")).toBeInTheDocument();
    
    // Assert that the contact info is displayed correctly
    expect(screen.getByText("For any query or info about product, feel free to call anytime. We are available 24X7.")).toBeInTheDocument();
    
    // Check the contact details (email, phone, support)
    expect(screen.getByText(/www.help@ecommerceapp.com/i)).toBeInTheDocument();
    expect(screen.getByText(/012-3456789/i)).toBeInTheDocument();
    expect(screen.getByText(/1800-0000-0000/i)).toBeInTheDocument();
    
    // Ensure the contact image is present
    const image = screen.getByAltText("contactus");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/contactus.jpeg');
  });

  test('ensure that it is a valid email', () => {
    // Render the Contact component
    render(<Contact />);
    
    const isValidEmail = (email) => {
        const stringRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
        // Extract the email address
        const match = email.match(stringRegex);
        const extractedEmail = match ? match[0] : null;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(extractedEmail);
    };
    const linkText = screen.getByText(/www\.help@ecommerceapp\.com/i);
    const linkContent = linkText.textContent;
    
    expect(isValidEmail(linkContent)).toBe(true);
  });
});
