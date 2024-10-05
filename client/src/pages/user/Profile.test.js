import '@testing-library/jest-dom';
import axios from "axios";
import { fireEvent, render, screen } from '@testing-library/react';
import Profile from "./Profile";
import toast from "react-hot-toast";
import { useAuth } from "../../context/auth";

jest.mock('../../context/auth', () => ({
    useAuth: jest.fn()
}));

jest.mock("axios", () => ({
    put: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
    error: jest.fn(),
    success: jest.fn(),
}));

const userMenuString = "User Menu";

jest.mock('../../components/Layout', () => ({ children }) => <div>{children}</div>);
jest.mock('../../components/UserMenu', () => () => <div>{userMenuString}</div>);

const originalUserProfile = {
    user: {
        name: "Halimah Yacob",
        email: "halimah@gov.sg", 
        password: "safePassword", 
        phone: "111", 
        address: "Not Istana"
    }, 
    token: "mockedToken"
};

const updatedUserProfile = {
    user: {
        name: "Tharman Shanmugaratnam",
        email: "tharman@gov.sg", 
        password: "evensaferPassword", 
        phone: "999", 
        address: "Istana"
    }, 
    token: "anotherMockedToken"
};

const emptyString = "";

Object.defineProperty(window, "localStorage", {
    value: {
        getItem: jest.fn(() => JSON.stringify(originalUserProfile)),
        setItem: jest.fn(),
    },
    writable: true,
});

describe("Profile", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue([originalUserProfile, jest.fn()]);
    });

    it("should initially render the user's information except for password", () => {
        const { name, email, password, phone, address } = originalUserProfile.user;
        render(<Profile />);
        expect(screen.getByText(userMenuString)).toBeInTheDocument();
        expect(screen.getByDisplayValue(name)).toBeInTheDocument();
        expect(screen.getByDisplayValue(email)).toBeInTheDocument();
        expect(screen.getByDisplayValue(emptyString)).toBeInTheDocument(); // Password is not displayed
        expect(screen.queryByDisplayValue(password)).not.toBeInTheDocument(); // Password is not displayed
        expect(screen.getByDisplayValue(phone)).toBeInTheDocument();
        expect(screen.getByDisplayValue(address)).toBeInTheDocument();
    });

    it('should allow updating the name, phone, and address', () => {
        render(<Profile />);

        const nameInput = screen.getByPlaceholderText('Enter Your Name');
        const emailInput = screen.getByPlaceholderText('Enter Your Email');
        const passwordInput = screen.getByPlaceholderText('Enter Your Password');
        const phoneInput = screen.getByPlaceholderText('Enter Your Phone');
        const addressInput = screen.getByPlaceholderText('Enter Your Address');

        fireEvent.change(nameInput, { target: { value: updatedUserProfile.user.name } });
        fireEvent.change(passwordInput, { target: { value: updatedUserProfile.user.password } });
        fireEvent.change(phoneInput, { target: { value: updatedUserProfile.user.phone } });
        fireEvent.change(addressInput, { target: { value: updatedUserProfile.user.address } });

        expect(nameInput.value).toBe(updatedUserProfile.user.name);
        expect(emailInput).toBeDisabled();
        expect(passwordInput.value).toBe(updatedUserProfile.user.password);
        expect(phoneInput.value).toBe(updatedUserProfile.user.phone);
        expect(addressInput.value).toBe(updatedUserProfile.user.address);
    });
});