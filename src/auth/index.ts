import { createHashSalt, verifyHashSalt } from './password';
import { sessionToken, verifySessionToken } from './sessionToken';
import { serverConfig } from '..';

export function validateSessionToken(req, res, next) {
    if (req.headers['authorization']) {
        let parts = req.headers['authorization'].split(' ');
        if (parts.length === 2) {
            let type = parts[0];
            if (type === 'Token') {
                let sessionTokenEncoded = parts[1];
                let sessionToken = verifySessionToken(sessionTokenEncoded, serverConfig['sessionSecret']);
                if (sessionToken !== null && sessionToken !== undefined
                    && sessionToken.createdAt + serverConfig['sessionTokenExpiresInMillis'] >= new Date().getTime()) {
                    req['sessionToken'] = sessionToken;
                }
            }
        }
    }
    return next();
}

export function createSessionToken(data: {}, createdAt: number) {
    return sessionToken(data, createdAt, serverConfig['sessionSecret']);
}

export { createHashSalt, verifyHashSalt, sessionToken, verifySessionToken };

/* Password generator
import * as assert from 'assert';
{
    let password = '0987654321';
    createHashSalt(password, (err: Error, hashSalt: string) => {
        verifyHashSalt(password, hashSalt, (err: Error, result: boolean) => {
            assert(result);
        })
        console.log(`${password}::${hashSalt}`);
    });
}
//*/
