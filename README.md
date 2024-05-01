# Praetor-Security

Praetor-Security is responsible for protecting all endpoints of the praetor-backend, ensuring robust and secure access controls.

## Installation

To install dependencies, you can use Yarn. Run the following command in the root directory of your project:

```bash
yarn install
```

## Running the Application

Depending on your development needs, you can start the application in various modes by running one of the following commands:

```bash
# Start the application in development mode
yarn start

# Start the application in watch mode
yarn start:dev

# Start the application in production mode
yarn start:prod
```

## Environment Variables

To run the project, you must set up the required environment variables. Create a .env file in the root directory and populate it with the following keys:

```bash
# Basic Configuration
NODE_ENV=development/production
PORT=3000

# MongoDB Configuration
MONGO_DB_CONNECTION_STRING=mongodb+srv://username:password@your-cluster-url
MONGO_DB_NAME=praetor-security

# Security Keys
PRIVATE_KEY=your_rsa_4096_private_key
PUBLIC_KEY=your_rsa_4096_public_key

# Service Endpoints
SECURITY_HOST=secure.yourdomainname.com
API_HOST=api.yourdomainname.com
APP_HOST=akash.yourdomainname.com

# Token Expiry Durations
ACCESS_TOKEN_DURATION=60 # in minutes
REFRESH_TOKEN_DURATION=30 # in minutes

# CORS Configuration
ALLOWED_CORS_ORIGINS=*
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```
