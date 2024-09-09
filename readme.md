Important Notice: This is a demo application intended solely for demonstration and testing purposes. It is not designed or secured for use in production environments. Please avoid using it to manage real data or in any live scenarios.


## Description
This demo app demonstrates the implementation of ID.me's Liveness Check to verify user liveness when attempting to edit sensitive Personally Identifiable Information (PII).

Liveness checks offer a strong defense against fraud, as bad actors are typically unwilling or unable to pass this verification step. The check requires users to show their fully uncovered face, ensuring they are not using masks or static images. If a user fails this step, they will be unable to proceed with the changes.

## Setup Instructions

### Prerequisites
- Node.js
- npm

### Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/stevenbarash/idme-livenesscheck-demo.git
    cd idme-livenesscheck-demo
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add your ID.me environment credentials:
    ```plaintext
    IDME_CLIENT_ID=your_client_id
    IDME_CLIENT_SECRET=your_client_secret
    IDME_REDIRECT_URI=your_redirect_uri
    ```

4. Start the application:
    ```bash
    npm start
    ```
