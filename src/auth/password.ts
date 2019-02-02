import * as crypto from 'crypto';

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
