const crypto = require('crypto');
const assert = require('assert');
const password = require('../../out/auth/password');

describe('Password (scrypt slows down the test)', () => {
    it('should create and verify - may take more time', done => {
        let randPassword = crypto.randomBytes(8).toString('hex');
        password.createHashSalt(randPassword, (err, hashSalt) => {
            assert(err === null);
            // Verify that hashSalt is base-16
            assert(typeof parseInt(hashSalt, 16 === 'number'));
            password.verifyHashSalt(randPassword, hashSalt, (err, result) => {
                assert(err === null);
                assert(result);
                done();
            });
        });
    });
});
