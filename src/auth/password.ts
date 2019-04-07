import * as scrypt from 'scrypt';

if (process.env.NODE_ENV == 'test') {
    var scryptParams = scrypt.paramsSync(0.001);
} else {
    var scryptParams = scrypt.paramsSync(0.1);
}

export function createHashSalt(password: String, callback: (err: Error, hashSalt: String) => void) {
    // Scrypt handles the salt internally and outputs it with the derived key
    // along with the params
    scrypt.kdf(password, scryptParams, (err: Error, hashSalt: Buffer) => {
        if (err) {
            callback(err, null);
        } else {
            callback(err, hashSalt.toString('hex'));
        }
    });
}

export function verifyHashSalt(password: string, hashSalt: string, callback: (err: Error, result: boolean) => void) {
    scrypt.verifyKdf(Buffer.from(hashSalt, 'hex'), password, (err: Error, result: boolean) => {
        if (err) {
            callback(err, null);
        } else {
            callback(err, result);
        }
    });
}
