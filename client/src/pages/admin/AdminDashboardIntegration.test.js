import React from 'react';
import AdminDashboard from './AdminDashboard';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/auth'
import { CartProvider } from '../../context/cart'
import { SearchProvider } from '../../context/search'
import '@testing-library/jest-dom/extend-expect';

/**
AdminDashboard uses the following:
1. useAuth()
2. Layout component
3. AdminMenu component

In this integration test, the objective is to test whether AdminDashboard is able to
work with the above 3 items.

However, if we look at the Layout component, it uses 2 other child components.
4. Header component
5. Footer component

The Header component uses useAuth(), useCart(), useCategory() and SearchInput component.
SearchInput component uses useSearch() and useNavigate(). useCategory() makes an API call to
/api/v1/category/get-category.


Thus, in the integration test, AdminDashboard is needed to be wrapped around AuthProvider,
CartProvider and SearchProvider to access the necessary contexts. However, we are only concerned
with what useAuth() returns, because useAuth() is used to populate AdminMenu component. We could
simulate what is returned by useCart(), useCategory() and the API call to /api/v1/category/get-category,
but that is not the point of this integration test since we are testing whether AdminDashboard can
integrate with items 1 - 3 above, instead of checking if Header itself is working correctly with
useCart() and useCategory().
*/


describe("AdminDashboard should successfully integrate with Layout, AdminMenu and useAuth()", () => {

  afterEach(() => {
    //Reset local storage
    localStorage.removeItem("auth");
  });


  it("when user data exists in localStorage", () => {
    /*
      We want to set some initial value in "auth" in localStorage so
      useAuth() can fetch it and populate it in AdminDashboard, testing
      the integration between useAuth() and AdminDashboard.
    */
    const initialAuthState = {
      user: {
        name: "James",
        email: "james@gmail.com",
        phone: "91234567",
        role: 1
      },
      token: "test-token"
    };
    localStorage.setItem("auth", JSON.stringify(initialAuthState));


    //Render the AdminDashboard component
    render(
      <AuthProvider>
        <CartProvider>
          <SearchProvider>
            <MemoryRouter>
              <AdminDashboard />
            </MemoryRouter>
          </SearchProvider>
        </CartProvider>
      </AuthProvider>
    );


    //Assert to see if integration is successful

    //Step 1: Check integration with useAuth()
    expect(screen.getByText("Admin Name : James")).toBeInTheDocument();
    expect(screen.getByText("Admin Email : james@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("Admin Contact : 91234567")).toBeInTheDocument();


    //Step 2: Check integration with AdminMenu
    expect(screen.getByText("Admin Name : James")).toBeInTheDocument();
    expect(screen.getByText("Create Category")).toBeInTheDocument();
    expect(screen.getByText("Create Product")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();


    //Step 3: Check integration with Layout which involves Header and SearchInput
    expect(screen.getByText("🛒 Virtual Vault")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Categories")).toBeInTheDocument();
    expect(screen.getByText("All Categories")).toBeInTheDocument();
    expect(screen.queryByText("Register")).not.toBeInTheDocument(); //Should not appear since user is logged in
    expect(screen.queryByText("Login")).not.toBeInTheDocument(); //Should not appear since user is logged in
    expect(screen.getByText("James")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Dashboard").closest('a')).toHaveAttribute('href', '/dashboard/admin'); //Route should reflect admin route
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.getByText("Cart")).toBeInTheDocument();
  });
});
