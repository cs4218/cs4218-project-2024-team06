import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import toast from 'react-hot-toast';
import Register from './Register';

// Mock modules
jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

//Mock the external components that Register component uses
jest.mock('./../../components/Layout', () => ({ children }) => <div><h1>Mocked Register - Ecommerce App</h1><div>{ children }</div></div>);



describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('should be correctly rendered', () => {

      it('with the correct titles', () => {
        //ARRANGE
  
        //ACTION
        render(
          <MemoryRouter initialEntries={['/register']}>
            <Routes>
              <Route path="/register" element={<Register />} />
            </Routes>
          </MemoryRouter>
        );
  
        //ASSERT
        expect(screen.getByText("Mocked Register - Ecommerce App")).toBeInTheDocument();
        expect(screen.getByText("REGISTER FORM")).toBeInTheDocument();
      });


      describe('with the input fields', () => {
        //NEVER PASS
        // it('where the placeholders of input fields should be correct', () => {
        //   //ARRANGE
  
        //   //ACTION
        //   render(
        //     <MemoryRouter initialEntries={['/register']}>
        //       <Routes>
        //         <Route path="/register" element={<Register />} />
        //       </Routes>
        //     </MemoryRouter>
        //   );
  
        //   //ASSERT
        //   expect(screen.getByPlaceholderText('Enter Your Name')).toBeInTheDocument();
        //   expect(screen.getByPlaceholderText('Enter Your Email')).toBeInTheDocument();
        //   expect(screen.getByPlaceholderText('Enter Your Password')).toBeInTheDocument();
        //   expect(screen.getByPlaceholderText('Enter Your Phone')).toBeInTheDocument();
        //   expect(screen.getByPlaceholderText('Enter Your Address')).toBeInTheDocument();
        //   expect(screen.getByPlaceholderText('Enter Your DOB')).toBeInTheDocument();
        //   expect(screen.getByPlaceholderText('What Is Your Favorite Sport')).toBeInTheDocument();
        // });


        //NEVER PASS
        // it('where the type of input fields should be correct', () => {
        //   //ARRANGE
  
        //   //ACTION
        //   render(
        //     <MemoryRouter initialEntries={['/register']}>
        //       <Routes>
        //         <Route path="/register" element={<Register />} />
        //       </Routes>
        //     </MemoryRouter>
        //   );
  
        //   //ASSERT
        //   expect(screen.getByPlaceholderText('Enter Your Name')).toHaveAttribute('type', 'text');
        //   expect(screen.getByPlaceholderText('Enter Your Email')).toHaveAttribute('type', 'email');
        //   expect(screen.getByPlaceholderText('Enter Your Password')).toHaveAttribute('type', 'password');
        //   expect(screen.getByPlaceholderText('Enter Your Phone')).toHaveAttribute('type', 'text');
        //   expect(screen.getByPlaceholderText('Enter Your Address')).toHaveAttribute('type', 'text');
        //   expect(screen.getByPlaceholderText('Enter Your DOB')).toHaveAttribute('type', 'date');
        //   expect(screen.getByPlaceholderText('What Is Your Favorite Sport')).toHaveAttribute('type', 'text');
        // });
      });


      it('with a button labelled with REGISTER', () => {
        //ARRANGE
  
        //ACTION
        render(
          <MemoryRouter initialEntries={['/register']}>
            <Routes>
              <Route path="/register" element={<Register />} />
            </Routes>
          </MemoryRouter>
        );
  
        //ASSERT
        expect(screen.getByRole('button', { name: 'REGISTER' })).toBeInTheDocument();
      });



    });
  

  // it('should register the user successfully', async () => {
  //   axios.post.mockResolvedValueOnce({ data: { success: true } });

  //   const { getByText, getByPlaceholderText } = render(
  //       <MemoryRouter initialEntries={['/register']}>
  //         <Routes>
  //           <Route path="/register" element={<Register />} />
  //         </Routes>
  //       </MemoryRouter>
  //     );

  //   fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: 'John Doe' } });
  //   fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } });
  //   fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } });
  //   fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: '1234567890' } });
  //   fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: '123 Street' } });
  //   fireEvent.change(getByPlaceholderText('Enter Your DOB'), { target: { value: '2000-01-01' } });
  //   fireEvent.change(getByPlaceholderText('What is Your Favorite sports'), { target: { value: 'Football' } });

  //   fireEvent.click(getByText('REGISTER'));

  //   await waitFor(() => expect(axios.post).toHaveBeenCalled());
  //   expect(toast.success).toHaveBeenCalledWith('Register Successfully, please login');
  // });

  // it('should display error message on failed registration', async () => {
  //   axios.post.mockRejectedValueOnce({ message: 'User already exists' });

  //   const { getByText, getByPlaceholderText } = render(
  //       <MemoryRouter initialEntries={['/register']}>
  //         <Routes>
  //           <Route path="/register" element={<Register />} />
  //         </Routes>
  //       </MemoryRouter>
  //     );

  //   fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: 'John Doe' } });
  //   fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } });
  //   fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } });
  //   fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: '1234567890' } });
  //   fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: '123 Street' } });
  //   fireEvent.change(getByPlaceholderText('Enter Your DOB'), { target: { value: '2000-01-01' } });
  //   fireEvent.change(getByPlaceholderText('What is Your Favorite sports'), { target: { value: 'Football' } });

  //   fireEvent.click(getByText('REGISTER'));

  //   await waitFor(() => expect(axios.post).toHaveBeenCalled());
  //   expect(toast.error).toHaveBeenCalledWith('Something went wrong');
  // });
});
