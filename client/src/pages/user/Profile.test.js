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
const nameInputPlaceholderText = "Enter Your Name";
const emailInputPlaceholderText = "Enter Your Email";
const passwordInputPlaceholderText = "Enter Your Password";
const phoneInputPlaceholderText = "Enter Your Phone";
const addressInputPlaceholderText = "Enter Your Address";
const updateButtonString = "UPDATE";

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

    it("should render and work properly", () => {
        const { name, email, password, phone, address } = originalUserProfile.user;
        render(<Profile />);

        // Check initial render
        expect(screen.getByText(userMenuString)).toBeInTheDocument();
        expect(screen.getByDisplayValue(name)).toBeInTheDocument();
        expect(screen.getByDisplayValue(email)).toBeInTheDocument();
        expect(screen.getByDisplayValue(emptyString)).toBeInTheDocument(); // Password is not displayed
        expect(screen.queryByDisplayValue(password)).not.toBeInTheDocument(); // Password is not displayed
        expect(screen.getByDisplayValue(phone)).toBeInTheDocument();
        expect(screen.getByDisplayValue(address)).toBeInTheDocument();
        expect(screen.getByText(updateButtonString)).toBeInTheDocument();

        // Check update of inputs
        const nameInput = screen.getByPlaceholderText(nameInputPlaceholderText);
        const emailInput = screen.getByPlaceholderText(emailInputPlaceholderText);
        const passwordInput = screen.getByPlaceholderText(passwordInputPlaceholderText);
        const phoneInput = screen.getByPlaceholderText(phoneInputPlaceholderText);
        const addressInput = screen.getByPlaceholderText(addressInputPlaceholderText);

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