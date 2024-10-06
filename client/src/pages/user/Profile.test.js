import '@testing-library/jest-dom';
import axios from "axios";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

let originalUserProfile = {
    user: {
        name: "Halimah Yacob",
        email: "halimah@gov.sg", 
        password: "safePassword", 
        phone: "111", 
        address: "Not Istana"
    }
};

const updatedUserProfile = {
    user: {
        name: "Tharman Shanmugaratnam",
        email: "halimah@gov.sg", 
        password: "evensaferPassword", 
        phone: "999", 
        address: "Istana"
    }
};

const emptyString = "";
const nameInputPlaceholderText = "Enter Your Name";
const emailInputPlaceholderText = "Enter Your Email";
const passwordInputPlaceholderText = "Enter Your Password";
const phoneInputPlaceholderText = "Enter Your Phone";
const addressInputPlaceholderText = "Enter Your Address";
const updateButtonString = /update/i;
const apiString = "/api/v1/auth/profile";
const localStorageKeytring = "auth";

Object.defineProperty(window, "localStorage", {
    value: {
        getItem: jest.fn(() => JSON.stringify(originalUserProfile)),
        setItem: jest.fn(),
    },
    writable: true,
});

describe("Profile", () => {
    const mockAuth = originalUserProfile;
    const mockSetAuth = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue([mockAuth, mockSetAuth]);
    });

    it("should render and work properly", async () => {
        const { name, email, password, phone, address } = mockAuth.user;
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

        // Check editing of inputs
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

        // Check update button
        const updateButton = screen.getByText(updateButtonString);
        axios.put.mockResolvedValue({ data: { updatedUser: updatedUserProfile.user } });
        fireEvent.click(updateButton);
        expect(axios.put).toHaveBeenCalledWith(apiString, updatedUserProfile.user);
        
        // Check update
        await waitFor(() => {    
            expect(mockSetAuth).toHaveBeenCalledTimes(1);
        })
        expect(mockSetAuth).toHaveBeenCalledWith({...mockAuth, user: updatedUserProfile.user });
        expect(window.localStorage.getItem).toHaveBeenCalledTimes(1);
        expect(window.localStorage.getItem).toHaveBeenCalledWith(localStorageKeytring);
        expect(window.localStorage.setItem).toHaveBeenCalledTimes(1);
        expect(window.localStorage.setItem).toHaveBeenCalledWith(localStorageKeytring, JSON.stringify({ user: updatedUserProfile.user }));
        expect(toast.success).toHaveBeenCalledTimes(1);
    });

    /**
     * This test is failing because data?.error is missplelt as data?.errro in the if condition in 
     * the original code. Thus, that if condition is never triggered and toast.error is never 
     * called.
     */
    it.failing("should handle error field in axios put response", async() => {
        render(<Profile />);

        const nameInput = screen.getByPlaceholderText(nameInputPlaceholderText);
        const passwordInput = screen.getByPlaceholderText(passwordInputPlaceholderText);
        const phoneInput = screen.getByPlaceholderText(phoneInputPlaceholderText);
        const addressInput = screen.getByPlaceholderText(addressInputPlaceholderText);

        fireEvent.change(nameInput, { target: { value: updatedUserProfile.user.name } });
        fireEvent.change(passwordInput, { target: { value: updatedUserProfile.user.password } });
        fireEvent.change(phoneInput, { target: { value: updatedUserProfile.user.phone } });
        fireEvent.change(addressInput, { target: { value: updatedUserProfile.user.address } });

        const updateButton = screen.getByText(updateButtonString);
        const mockErrorMessage = "Mocked Error message";
        axios.put.mockResolvedValue({ data: { updatedUser: updatedUserProfile.user, error: mockErrorMessage } });
        fireEvent.click(updateButton);
        expect(axios.put).toHaveBeenCalledWith(apiString, updatedUserProfile.user);
        
        expect(mockSetAuth).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledTimes(1);
        expect(toast.error).toHaveBeenCalledWith(mockErrorMessage);
    })

    it.failing("should handle useAuth error", async () => {
        const consoleErrorSpy = jest.spyOn(console, "error");
        const mockedError = new Error("useAuth error");
        useAuth.mockImplementation(() => {
            throw mockedError;
        });
        expect(() => render(<Profile />)).toThrow(mockedError);
        expect(consoleErrorSpy).not.toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
    });
});