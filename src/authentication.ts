// Authentication endpoints are located in endpoints.ts
// This file contains verifications ans such
import { server } from './main';
import * as crypto from 'crypto';
import * as assert from 'assert';

export function hashSalt(password: string, callback: (salt: Buffer, derivedKey: Buffer) => void) {
    crypto.randomBytes(32, (err: Error, salt: Buffer) => {
        crypto.pbkdf2(password, salt, 4096, 32, 'sha256', (err: Error, derivedKey: Buffer) => {
            callback(salt, derivedKey);
        });
    });
}

export function verifyHashSalt(password: string, salt: Buffer, derivedKey: Buffer, callback: (result: boolean) => void) {
    crypto.pbkdf2(password, salt, 4096, 32, 'sha256', (err: Error, derivedKey2: Buffer) => {
        callback(derivedKey.compare(derivedKey2) == 0);
    });
}

// Verify that *hashSalt* and *verifyHashSalt* use the same settings.
{
    let password = crypto.randomBytes(10).toString('hex');
    hashSalt(password, (salt: Buffer, derivedKey: Buffer) => {
        verifyHashSalt(password, salt, derivedKey, (result: boolean) => {
            assert(result, 'Password hash-salting functions use different settings!');
        })
    });
}

// Authentication
server.use((req, res, next) => {
    return next();
});
