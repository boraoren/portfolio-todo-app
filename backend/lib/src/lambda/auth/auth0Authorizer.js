import 'source-map-support/register';
import { decode, verify } from 'jsonwebtoken';
import Axios from 'axios';
import { getToken } from '../../auth/utils';
const jwkToPem = require('jwk-to-pem');
export const handler = async (event) => {
    console.info('Authorizing a user', event.authorizationToken);
    try {
        const jwtToken = await verifyToken(event.authorizationToken);
        console.info('User was authorized', jwtToken);
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
        };
    }
    catch (e) {
        console.error('User not authorized', { error: e.message });
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
        };
    }
};
async function verifyToken(authHeader) {
    const jwksUrl = 'https://boren.au.auth0.com/.well-known/jwks.json';
    const token = getToken(authHeader);
    const jwt = decode(token, { complete: true });
    const response = await Axios(jwksUrl);
    const keyData = response.data;
    const signingKey = keyData['keys']
        .find(key => key['kid'] === jwt['header']['kid']);
    if (!signingKey) {
        throw new Error('Invalid Signing key');
    }
    return verify(token, jwkToPem(signingKey), { algorithms: ['RS256'] });
}
//# sourceMappingURL=auth0Authorizer.js.map