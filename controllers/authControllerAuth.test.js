import { registerController } from './authController';

// Mock functions
jest.mock('./../helpers/authHelper', () => ({
    // comparePassword:
    hashPassword: jest.fn(async (password) => Promise.resolve(password)),
}));

// Test suite for registerController
describe('registerController', () => {
    

    beforeEach(() => {
        jest.clearAllMocks();
    });

   
    describe('should return error message if', () => {
        let res;

        beforeEach(() => {
            //Mock the send function
            res = {
                send: jest.fn()
            };
        });


        it('name is empty', async () => {
            //ARRANGE
            const req = {
                body: {
                    name: "",
                    email: "",
                    password: "",
                    phone: "",
                    address: "",
                    answer: ""
                }
            };
    
            //ACTION
            await registerController(req, res);

            
            //ASSERT
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({ message: "Name is Required" });
        });


        it('name is purely whitespace', async () => {
            //ARRANGE
            const req = {
                body: {
                    name: " ",
                    email: "",
                    password: "",
                    phone: "",
                    address: "",
                    answer: ""
                }
            };
    
            //ACTION
            await registerController(req, res);

            
            //ASSERT
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({ message: "Name is Required" });
        });


        it('email is empty', async () => {
            //ARRANGE
            const req = {
                body: {
                    name: "James",
                    email: "",
                    password: "",
                    phone: "",
                    address: "",
                    answer: ""
                }
            };
    
            //ACTION
            await registerController(req, res);

            
            //ASSERT
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({ message: "Email is Required" });
        });


        it('email is purely whitespace', async () => {
            //ARRANGE
            const req = {
                body: {
                    name: "James",
                    email: "  ",
                    password: "",
                    phone: "",
                    address: "",
                    answer: ""
                }
            };
    
            //ACTION
            await registerController(req, res);

            
            //ASSERT
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({ message: "Email is Required" });
        });


        it('email is not a valid email address', async () => {
            //ARRANGE
            const req = {
                body: {
                    name: "James",
                    email: "james",
                    password: "",
                    phone: "",
                    address: "",
                    answer: ""
                }
            };
    
            //ACTION
            await registerController(req, res);

            
            //ASSERT
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({ message: "Email is Required" });
        });


        it('password is empty', async () => {
            //ARRANGE
            const req = {
                body: {
                    name: "James",
                    email: "james@gmail.com",
                    password: "",
                    phone: "",
                    address: "",
                    answer: ""
                }
            };
    
            //ACTION
            await registerController(req, res);

            
            //ASSERT
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({ message: "Password is Required" });
        });


        it('password is purely whitespace', async () => {
            //ARRANGE
            const req = {
                body: {
                    name: "James",
                    email: "james@gmail.com",
                    password: " ",
                    phone: "",
                    address: "",
                    answer: ""
                }
            };
    
            //ACTION
            await registerController(req, res);

            
            //ASSERT
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({ message: "Password is Required" });
        });


        it('phone number is empty', async () => {
            //ARRANGE
            const req = {
                body: {
                    name: "James",
                    email: "james",
                    password: "james123",
                    phone: "",
                    address: "",
                    answer: ""
                }
            };
    
            //ACTION
            await registerController(req, res);

            
            //ASSERT
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({ message: "Phone no is Required" });
        });


        it('phone is not a valid phone number', async () => {
            //ARRANGE
            const req = {
                body: {
                    name: "James",
                    email: "james",
                    password: "james123",
                    phone: "1",
                    address: "",
                    answer: ""
                }
            };
    
            //ACTION
            await registerController(req, res);

            
            //ASSERT
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({ message: "Phone no is Required" });
        });


        it('address is empty', async () => {
            //ARRANGE
            const req = {
                body: {
                    name: "James",
                    email: "james",
                    password: "james123",
                    phone: "9123 4567",
                    address: "",
                    answer: ""
                }
            };
    
            //ACTION
            await registerController(req, res);

            
            //ASSERT
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({ message: "Address is Required" });
        });


        it('address is purely whitespace', async () => {
            //ARRANGE
            const req = {
                body: {
                    name: "James",
                    email: "james",
                    password: "james123",
                    phone: "9123 4567",
                    address: " ",
                    answer: ""
                }
            };
    
            //ACTION
            await registerController(req, res);

            
            //ASSERT
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({ message: "Address is Required" });
        });


        it('answer is empty', async () => {
            //ARRANGE
            const req = {
                body: {
                    name: "James",
                    email: "james",
                    password: "james123",
                    phone: "9123 4567",
                    address: "Sentosa",
                    answer: ""
                }
            };
    
            //ACTION
            await registerController(req, res);

            
            //ASSERT
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({ message: "Answer is Required" });
        });

        // it('answer is purely whitespace', async () => {
        //     //ARRANGE
        //     const req = {
        //         body: {
        //             name: "James",
        //             email: "james",
        //             password: "james123",
        //             phone: "9123 4567",
        //             address: "",
        //             answer: " "
        //         }
        //     };
    
        //     //ACTION
        //     await registerController(req, res);

            
        //     //ASSERT
        //     expect(res.send).toHaveBeenCalledTimes(1);
        //     expect(res.send).toHaveBeenCalledWith({ message: "Answer is Required" });
        // });


    });
});