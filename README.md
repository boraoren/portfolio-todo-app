# PORTFOLIO TODO APPLICATION
Simple TODO application 
using AWS [Lambda](https://aws.amazon.com/lambda/) 
and [Serverless](https://serverless.com/) framework. 

1. [CLIENT](#frontend)
   1. [Client Authentication](#authentication)
   1. [Client run](#run)
1. [BACKEND](#backend)
   1. [Backend run](#backend-run)
      1. [DynamoDB](#dynamodb)
  
# CLIENT
The `client` folder contains a web 
application that can use the API that 
should be developed in the project.

This frontend should work with your 
serverless application once it is developed, 
you don't need to make any changes to the code. 
The only file that you need to edit is the 
`config.ts` file in the `client` folder. 
This file configures your client application 
just as it was done in the course and contains 
an API endpoint and Auth0 configuration:

```ts
const apiId = '...' API Gateway id
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: '...',    // Domain from Auth0
  clientId: '...',  // Client id from an Auth0 application
  callbackUrl: 'http://localhost:3000/callback'
}
```

## Client Authentication
To implement authentication in your application, 
you would have to create an Auth0 application and 
copy "domain" and "client id" to the `config.ts file 
in the `client` folder. We recommend using 
asymmetrically encrypted JWT tokens.

## Client Run
To run a client application first edit the 
`client/src/config.ts` file to set correct parameters. 
And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server 
with the React application that will interact 
with the serverless TODO application.

# BACKEND

## Backend run
```
cd backend
npm install
sls deploy -v
```

## DynamoDB
Table name is `TodoTable`
