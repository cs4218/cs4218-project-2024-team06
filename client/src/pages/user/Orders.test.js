import '@testing-library/jest-dom';
import axios from "axios";
import Orders from "./Orders";
import { render, screen } from "@testing-library/react";
import { useAuth } from '../../context/auth';

jest.mock('../../context/auth', () => ({
    useAuth: jest.fn()
}));
jest.mock('axios');
jest.mock('../../components/Layout', () => ({ children }) => <div>{children}</div>);
jest.mock('../../components/UserMenu', () => () => <div>User Menu</div>);

const mockOrders = [
    {
      _id: "1",
      status: "Processing",
      buyer: { name: "John Doe" },
      createAt: new Date().toISOString(),
      payment: { success: true },
      products: [
        { _id: "p1", name: "Product 1", description: "Description 1", price: 100 },
        { _id: "p2", name: "Product 2", description: "Description 2", price: 150 },
      ],
    }, 
    {
      _id: "2",
      status: "Delivered",
      buyer: { name: "Jane Doe" },
      createAt: new Date().toISOString(),
      payment: { success: false },
      products: [
        { _id: "p3", name: "Product 3", description: "Description 3", price: 200 },
        { _id: "p4", name: "Product 4", description: "Description 4", price: 250 },
      ],
    },
];

describe("Orders", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue([{ token: "mockToken" }, jest.fn()]);
        axios.get.mockResolvedValue({ data: mockOrders });
    });

    const checkProducts = async (products) => {
        for(let i = 0; i < products.length; i++) {
            const product = products[i];
            expect(await screen.findByAltText(product.name)).toBeInTheDocument();
            expect(await screen.findByText(product.name)).toBeInTheDocument();
            expect(await screen.findByText(product.description.substring(0, 30))).toBeInTheDocument();
            expect(await screen.findByText("Price : " + product.price)).toBeInTheDocument();
        }
    };

    const checkOrders = async (orders) => {
        for(let i = 0; i < orders.length; i++) {
            const order = orders[i];
            expect(await screen.findByText("#")).toBeInTheDocument();
            expect(await screen.findByText("Status")).toBeInTheDocument();
            expect(await screen.findByText("Buyer")).toBeInTheDocument();
            expect(await screen.findByText("date")).toBeInTheDocument();
            expect(await screen.findByText("Payment")).toBeInTheDocument();
            expect(await screen.findByText("Quantity")).toBeInTheDocument();

            expect(await screen.findByText(i + 1)).toBeInTheDocument();
            expect(await screen.findByText(order.status)).toBeInTheDocument();
            expect(await screen.findByText(order.buyer.name)).toBeInTheDocument();
            expect(await screen.findByText(order.payment.success ? "Success" : "Failed")).toBeInTheDocument();
            expect(await screen.findByText(order.products.length)).toBeInTheDocument();
            checkProducts(order.products);
        }
    };

    it("should render orders and products", async () => {
        render(<Orders />);
        expect(await screen.findByText("User Menu")).toBeInTheDocument();
        expect(screen.getByText("All Orders")).toBeInTheDocument();
        checkOrders(mockOrders);
    });
})