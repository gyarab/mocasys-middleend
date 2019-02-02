import { hashSalt, verifyHashSalt } from './password';
import { sessionToken, verifySessionToken } from './sessionToken';
import { server, serverConfig } from '..';
import * as assert from 'assert';

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

export { hashSalt, verifyHashSalt, sessionToken, verifySessionToken };

/* Password generator
{
    let password = '1234567890';
    hashSalt(password, (salt: Buffer, derivedKey: Buffer) => {
        verifyHashSalt(password, salt, derivedKey, (result) => {
            assert(result);
        })
        console.log(`${password}::${salt.toString('hex')}:${derivedKey.toString('hex')}`);
    });
    let password2 = '0987654321';
    hashSalt(password2, (salt: Buffer, derivedKey: Buffer) => {
        verifyHashSalt(password2, salt, derivedKey, (result) => {
            assert(result);
        })
        console.log(`${password2}::${salt.toString('hex')}:${derivedKey.toString('hex')}`);
    });
}
//*/
