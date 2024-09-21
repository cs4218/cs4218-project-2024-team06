import React from "react";
import { useEffect } from "react";
import { screen, render, renderHook } from "@testing-library/react";
import { CartProvider, useCart } from "./cart";
import '@testing-library/jest-dom/extend-expect';

const TestComponent = () => {
    const [cart] = useCart();
    return (
        <div>
            Cart Length: {cart.length}
        </div>
    );
};

const TestUpdateComponent = () => {
    const [cart, setCart] = useCart();
    useEffect(() => {
        setCart([{ id: 1 }, { id: 2 }])
    }, []);

    return (
        <div>
            Cart Length: {cart.length}
        </div>
    )
}

const renderComponent = () => {
    render (
        <CartProvider>
            <TestComponent/>
        </CartProvider>
    );
};

const renderTestComponent = () => {
    render (
        <CartProvider>
            <TestUpdateComponent/>
        </CartProvider>
    );
};

describe(('cartProvider'), () => {
    beforeEach(() => {
        jest.clearAllMocks();

        Object.defineProperty(window, 'localStorage', {
            value: {
                setItem: jest.fn(),
                getItem: jest.fn(),
                removeItem: jest.fn(),
            },
            writable: true,
        });
    });
    
    test('should initially render with no items in cart', () => {
        localStorage.getItem.mockReturnValue(null);

        renderComponent();
        
        expect(screen.getByText('Cart Length: 0')).toBeInTheDocument();
    });

    test('should render correct number of items from local storage', () => {
        const mockCart = JSON.stringify([{ id: 1 }, { id: 2 }]);
        localStorage.getItem.mockReturnValue(mockCart);

        renderComponent();

        expect(screen.getByText('Cart Length: 2')).toBeInTheDocument();
    });

    test('should update cart state correctly', () => {
        renderTestComponent();

        expect(screen.getByText('Cart Length: 2')).toBeInTheDocument();
    });
});