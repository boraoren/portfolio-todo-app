import {CustomAuthorizerEvent, CustomAuthorizerResult} from 'aws-lambda'
import 'source-map-support/register'
import {decode, verify} from 'jsonwebtoken'
import Axios from 'axios'
import {Jwt} from '../../auth/Jwt'
import {JwtPayload} from '../../auth/JwtPayload'
import {getToken} from '../../auth/utils'
import {createLogger} from "../../utils/logger";
const jwkToPem = require('jwk-to-pem')

const logger = createLogger('auth0Authorizer')

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
    logger.info('Authorizing a user', event.authorizationToken);
    try {
        const jwtToken = await verifyToken(event.authorizationToken);
        logger.info('User was authorized', jwtToken);

        return {
            principalId: jwtToken.sub,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: '*'
                    }
                ]
            }
        }
    } catch (e) {
        console.error('User not authorized', {error: e.message})

        return {
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: '*'
                    }
                ]
            }
        }
    }
};

async function verifyToken(authHeader: string): Promise<JwtPayload> {
    const jwksUrl = 'https://boren.au.auth0.com/.well-known/jwks.json';
    const token = getToken(authHeader);
    const jwt: Jwt = decode(token, {complete: true}) as Jwt;
    const response = await Axios(jwksUrl);
    const keyData = response.data;

    const signingKey = keyData['keys']
        .find(key => key['kid'] === jwt['header']['kid']);

    if (!signingKey) {
        throw new Error('Invalid Signing key');
    }

    //https://github.com/serverless/examples/pull/245/files#
    return verify(token,
        jwkToPem(signingKey),
        {algorithms: ['RS256']}) as JwtPayload;
}
