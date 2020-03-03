import { decode } from 'jsonwebtoken';
export function parseUserId(jwtToken) {
    const decodedJwt = decode(jwtToken);
    return decodedJwt.sub;
}
export function getToken(authHeader) {
    if (!authHeader)
        throw new Error('No authentication header');
    if (!authHeader.toLowerCase().startsWith('bearer '))
        throw new Error('Invalid authentication header');
    const split = authHeader.split(' ');
    return split[1];
}
//# sourceMappingURL=utils.js.map