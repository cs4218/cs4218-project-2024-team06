## Virtual Vault
Virtual Vault is a full stack e-commerce website, built using MERN stack (MongoDB, Express.js, React.js and Node.js). Features include user authentication, payment gateway integration, search and filters for products, and product set. 🛒

The focus of this repository is to provide **comprehensive testing** for Virtual Vault in order to identify issues and bugs.

- [x] Unit Testing (Jest)
- [x] Continous Integration with build and unit testing (GitHub Actions)
- [x] Integration Testing (Jest)
- [x] UI Testing (PlayWright)
- [x] Code Coverage (SonarQube)
- [x] Performance Testing (JMeter)


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

### How to Run Unit and Integration Tests
To run an individual unit or integration test, run the following command in the root directory.
```
npm test -- <Name of Unit Test File>
#e.g. npm test -- AdminDashboard.test.js
#e.g. npm test -- RegisterIntegration.test.js
```

To run all tests (unit + integration) at once, run the following command in the root directory.
```
npm test
```

> [!NOTE]
> Ensure that your local server is not running in another terminal before running the integration tests. This is because some integration tests would spin up a server for testing, so they would not work if your local server is running in another terminal.

### How to Run UI Tests

#### Running a Single UI Test
The following illustrates the steps required to run a UI test, demonstrating it through an example.

1. Suppose we want to run a UI test called `adminCreateCategory.spec.mjs`.
2. Head to `.env`. Replace `MONGO_URL` with the URL of a test database.

> [!WARNING]  
> Please make sure that you update the `.env` file with the URL of a test database,
as the UI tests would wipe out the memory of the database during execution.

3. In a terminal, run `npm run dev` to start the local server.

4. In another terminal, run one of the following commands to execute the UI test.

```
#To generate test results in HTML format
npx playwright test adminCreateCategory.spec.mjs

#To view test results in UI mode
npx playwright test adminCreateCategory.spec.mjs -- ui
```

#### Running All UI Tests
To run all UI tests in the `tests` folder at once, use the following command. However, we would **discourage** doing this because the quick succession of some UI tests could lead to indeterministic test results at times.
```
#Runs all UI tests
npx playwright test tests/
```

### How to Run Performance Tests
Ensure that you have [JMeter](https://dlcdn.apache.org//jmeter/binaries/apache-jmeter-5.6.3.zip) downloaded on your computer. The detailed instructions on how to run the performance tests can be found in the respective READMEs in the `performance-tests` folder.


### Location of Test Files
- Unit and integration tests are located in the same folder as the components that they are testing for.
- UI tests are located in the `tests` folder found in the root directory.
- Performance tests are located in the `performance-tests` folder found in the root directory.


### Integration Test Contributions
| Integration Test File                                                | Member    |
|----------------------------------------------------------------------|-----------|
| client/src/pages/admin/AdminDashboardIntegration.test.js             | Eugene    |
| middlewares/authMiddlewareIntegration.test.js                        | Eugene    |
| controllers/forgotPasswordControllerIntegration.test.js              | Eugene    |
| client/src/pages/Auth/RegisterIntegration.test.js                    | Eugene    |
| client/src/pages/Auth/LoginIntegration.test.js                       | Eugene    |
| helpers/authHelperIntegration.test.js                                | Eugene    |
| client/src/pages/admin/CreateCategoryIntegration.test.js             | Aishwarya |
| controllers/createProductControllerIntegration.test.js               | Aishwarya |
| controllers/deleteProductControllerIntegration.test.js               | Aishwarya |
| controllers/updateProductControllerIntegration.test.js               | Aishwarya |
| client/src/pages/user/DashboardIntegration.test.js                   | Kai Xun   |
| client/src/pages/user/OrdersIntegration.test.js                      | Kai Xun   |
| controllers/authControllerOrderStatusControllerIntegration.test.js   | Kai Xun   |
| controllers/authControllerUpdateProfileControllerIntegration.test.js | Kai Xun   |
| controllers/getProductControllerIntegration.test.js                  | Kang Quan |
| controllers/productCountControllerIntegration.test.js                | Kang Quan |
| controllers/productPhotoControllerIntegration.test.js                | Kang Quan |
| controllers/productFiltersControllerIntegration.test.js              | Kang Quan |
| controllers/categoriesIntegration.test.js                            | Zenith    |
| controllers/categoryControllerIntegration.test.js                    | Zenith    |
| controllers/productControllerIntegration.test.js                     | Zenith    |


### UI Test Contributions
| UI Test File                                  | Member    |
|-----------------------------------------------|-----------|
| tests/adminCreateCategory.spec.mjs            | Eugene    |
| tests/searchProductBySearchBar.spec.mjs       | Eugene    |
| tests/updateProfile.spec.mjs                  | Eugene    |
| tests/adminCreateProduct.spec.mjs             | Aishwarya |
| tests/adminDeleteProducts.spec.mjs            | Aishwarya |
| tests/adminUpdateProductsCategories.spec.mjs  | Aishwarya |
| tests/adminUpdateOrderStatus.spec.mjs         | Kai Xun   |
| tests/createOrder.spec.mjs                    | Kai Xun   |
| tests/userViewOrder.spec.mjs                  | Kai Xun   |
| tests/authenticatedAddingAndRemoving.spec.cjs | Kang Quan |
| tests/register.spec.cjs                       | Kang Quan |
| tests/unauthenticatedCheckout.spec.cjs        | Kang Quan |
| tests/cartToCheckout.spec.mjs                 | Zenith    |
| tests/filterCategories.spec.mjs               | Zenith    |
| tests/filterPrice.spec.mjs                    | Zenith    |


### Performance Test Contributions
| What performance is being tested | Member    |
|----------------------------------|-----------|
| /api/v1/auth/register            | Eugene    |
| /api/v1/product/get-product      | Aishwarya |
| /api/v1/auth/orders              | Kai Xun   |
| /api/v1/product/search/:keyword  | Kang Quan |
| /api/v1/category/get-category    | Zenith    |