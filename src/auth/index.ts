import { createHashSalt, verifyHashSalt } from './password';
import { sessionToken, verifySessionToken } from './sessionToken';
import { server, serverConfig } from '..';

server.use((req, res, next) => {
    if (req.headers['authorization']) {
        let parts = req.headers['authorization'].split(' ');
        if (parts.length === 2) {
            let type = parts[0];
            if (type === 'Token') {
                let sessionToken = parts[1];
                req['sessionToken'] = verifySessionToken(sessionToken, serverConfig['sessionSecret']);
            }
        }
    }
    return next();
});

export function createSessionToken(data: {}, createdAt: number) {
    return sessionToken(data, createdAt, serverConfig['sessionSecret']);
}

export { createHashSalt, verifyHashSalt, sessionToken, verifySessionToken };

/* Password generator
import * as assert from 'assert';
{
    let password = '0987654321';
    createHashSalt(password, (hashSalt: string) => {
        verifyHashSalt(password, hashSalt, (result) => {
            assert(result);
        })
        console.log(`${password}::${hashSalt}`);
    });
}
//*/
