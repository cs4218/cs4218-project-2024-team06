import '@testing-library/jest-dom';
import axios from "axios";
import Profile from "./Profile";
import { render, screen } from '@testing-library/react';
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

const mockUser = {
    user: {
        name: "Halimah Yacob",
        email: "halimah@gov.sg", 
        password: "safePassword", 
        phone: "999", 
        address: "Istana"
    }, 
    token: "mockedToken"
};

const emptyString = "";

Object.defineProperty(window, "localStorage", {
    value: {
        getItem: jest.fn(() => JSON.stringify(mockUser)),
        setItem: jest.fn(),
    },
    writable: true,
});

describe("Profile", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue([mockUser, jest.fn()]);
    });

    it("should initially render the user's information except for password", () => {
        const { name, email, password, phone, address } = mockUser.user;
        render(<Profile />);
        expect(screen.getByText(userMenuString)).toBeInTheDocument();
        expect(screen.getByDisplayValue(name)).toBeInTheDocument();
        expect(screen.getByDisplayValue(email)).toBeInTheDocument();
        expect(screen.getByDisplayValue(emptyString)).toBeInTheDocument(); // Password is not displayed
        expect(screen.queryByDisplayValue(password)).not.toBeInTheDocument(); // Password is not displayed
        expect(screen.getByDisplayValue(phone)).toBeInTheDocument();
        expect(screen.getByDisplayValue(address)).toBeInTheDocument();
    });
});