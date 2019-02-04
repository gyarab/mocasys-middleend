import * as scrypt from 'scrypt';

const scryptParams = scrypt.paramsSync(0.1);

// TODO: Handle errors
export function createHashSalt(password: string, callback: (hashSalt: string) => void) {
    // Scrypt handles the salt internally and outputs it with the derived key
    // along with the params
    scrypt.kdf(password, scryptParams, (err: Error, hashSalt: Buffer) => {
        callback(hashSalt.toString('hex'));
    });
}

// TODO: Handle errors
export function verifyHashSalt(password: string, hashSalt: string, callback: (result: boolean) => void) {
    scrypt.verifyKdf(Buffer.from(hashSalt, 'hex'), password, (err: Error, result: boolean) => {
        callback(result);
    });
}
