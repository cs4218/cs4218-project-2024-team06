## Load and Stress Testing for Register API

This folder contains the JMeter test plans for performing load and stress testing for the Register API (`/api/v1/auth/register`). ⚙️

### Strategy
I first tested for a load of 5 users registering concurrently in a duration of 1s. This load is an average load reasonable for a
small to medium-sized ecommerce site.

Thereafter, I performed stress testing, gradually incrementing the load on the server. I tried 10, 50, 100, 200, 300, ... 900 and 1000 registrations
within 1s. The purpose is to determine what is the maximum load the server can handle. This is because during special occasions like road shows, Virtual Vault
may be trying to get more customers onboard as users. I realised that from 700 threads onwards, the error rate is non-zero. Thus, to find out the maximum
load the server can handle, I performed binary search between 600 and 700 threads. Eventually, I found out that 666 threads is the maximum load that the server
can handle within 1s.


### How to Run Tests
1. Start Virtual Vault locally using `npm run dev`. I recommend running it using a test database where there is no data in the `users` collection.
1. Launch the JMeter executable file.
2. In JMeter, open the desired test plan. For example, if you wish to test for 5 threads, open the `register_5.jmx` file.
3. Run the test plan.
4. View results via the listeners.
5. Verify that users are indeed created in the `users` collection via MongoDB Atlas.
6. If you want to run another test, remove any data from the `users` collection. This is because all the tests will read in data from the `userdata.csv` file as input, so if you do not reset the data across runs, there will be errors due to users already existing in the database.

> [!NOTE]
> Before you run any test in JMeter, ensure that you have **started a local server running Virtual Vault** (preferably with a database that has no users). Also, please make sure that the JMeter test plan file that you want to run is located in the **same directory** as `userdata.csv` as the test plan file reads the data from the csv file.


### Remarks
I am running the tests on my own computer as the server, so the results may differ when you run it on your local computer. Also, the time taken to
run X number of threads may differ across runs. The results are just an indication of the process I took in load and stress testing. 😄