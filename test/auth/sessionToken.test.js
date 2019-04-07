const assert = require('assert');
const crypto = require('crypto');

const sessionT = require('../../out/auth/sessionToken');
const sessionSecret = require('config').get('server')['sessionSecret']

describe('SessionToken', () => {
    it('should create and verify', () => {
        let randData1 = crypto.randomBytes(2).toString('hex');
        let randData2 = crypto.randomBytes(4).toString('hex');

        let sessionToken = sessionT.sessionToken({
            randData1: randData2,
            randData2, randData1
        }, new Date().getTime(), sessionSecret);
        let result = sessionT.verifySessionToken(sessionToken, sessionSecret);

        assert(result);
    });
});
