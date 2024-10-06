## Virtual Vault
Virtual Vault is a full stack e-commerce website, built using MERN stack (MongoDB, Express.js, React.js and Node.js). Features include user authentication, payment gateway integration, search and filters for products, and product set. 🛒

The focus of this repository is to provide **comprehensive testing** for Virtual Vault in order to identify issues and bugs.

- [x] Unit Testing
- [x] Continous Integration with build and unit testing
- [ ] Integration Testing
- [ ] UI Testing
- [ ] Code Coverage
- [ ] Performance Testing


### How to Run the Application
To run Virtual Vault, follow these steps.

1. Clone the repository to your local directory.
```
git clone https://github.com/cs4218/cs4218-project-2024-team06.git
```

2. Open the repository in a code editor of your choice, such as Visual Studio Code.

3. In the root directory, install the server-side dependencies.
```
npm install
```

4. Change directory to the client directory and install the client-side dependencies.
```
cd client
npm install
```
5. Return to the root directory and create a .env file. The .env file should have the following fields.
```
PORT = 6060
DEV_MODE = development
MONGO_URL = <Insert your MongoDB database URL>
JWT_SECRET = <Insert your JWT secret key>
BRAINTREE_MERCHANT_ID = <Insert your BrainTree merchant ID>
BRAINTREE_PUBLIC_KEY = <Insert your BrainTree public key>
BRAINTREE_PRIVATE_KEY = <Insert your Braintree private key>
```

6. Run the following command to start the application
```
npm run dev
```

### How to Run Unit Tests
To run an individual unit test, run the following command in the root directory.
```
npm test -- <Name of Unit Test File>
#e.g. npm test -- AdminDashboard.test.js
```

To run all unit tests at once, run the following command in the root directory.
```
npm test
```