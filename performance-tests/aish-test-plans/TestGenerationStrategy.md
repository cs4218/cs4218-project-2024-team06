# Load Testing with JMeter CLI

Following the [JMeter official resource](https://jmeter.apache.org/usermanual/best-practices.html), load testing was executed using the CLI. The steps followed include:

## Tested API/Functionality: `/api/v1/product/get-product` to get all products

1. **Create Test Plan**: 
   - A test plan was created in the GUI as explained in the lab.

2. **Create Multiple Test Plans**:
   - Four test plans were created with increasing numbers of users: 5, 25, 125, and 625.

3. **More Details**: 
   - Additional details on choices and observations can be found in the individual report submitted.

4. **Generate `.jtl` Results Using CLI**:
   - Use command following given format to generate `.jtl` files with test results: `jmeter -n -t <TEST_PLAN_NAME>.jmx -l <RESULT_FILE_NAME>.jtl`

5. **Generate HTML Reports Using CLI**:
   - Use command following given format to generate HTML reports from the `.jtl` files: `jmeter -g <RESULT_FILE_NAME>.jtl -o <REPORT_FOLDER_NAME>`

6. **Organize Resources**:
   - In this branch, all `.jtl`, `.jtx`, and HTML report resources are stored in folders with corresponding names.
