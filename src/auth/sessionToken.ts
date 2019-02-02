import * as crypto from 'crypto';

// Session Authentication Token
/*
encKey := HMAC-SHA-256(secret, 'cookiesession-encryption');
sigKey := HMAC-SHA-256(secret, 'cookiesession-signature');

sessionText := cookieName || '=' || sessionJson
  iv := secureRandom(16 bytes)
  ciphertext := AES-256-CBC(encKey, iv, sessionText)
  payload := iv || '.' || ciphertext || '.' || createdAt || '.' || duration
  hmac := HMAC-SHA-256(sigKey, payload)
  cookie := base64url(iv) || '.' ||
    base64url(ciphertext) || '.' ||
    createdAt || '.' ||
    duration || '.' ||
    base64url(hmac) 

from: https://github.com/mozilla/node-client-sessions
*/
function base64urlencode(arg: any): Buffer {
    var s = arg.toString('base64');
    s = s.split('=')[0]; // Remove any trailing '='s
    s = s.replace(/\+/g, '-'); // 62nd char of encoding
    s = s.replace(/\//g, '_'); // 63rd char of encoding
    // TODO optimize this; we can do much better
    return s;
}

function base64urldecode(arg: any): Buffer {
    var s = arg;
    s = s.replace(/-/g, '+'); // 62nd char of encoding
    s = s.replace(/_/g, '/'); // 63rd char of encoding
    switch (s.length % 4) { // Pad with trailing '='s
        case 0:
            break; // No pad chars in this case
        case 2:
            s += "==";
            break; // Two pad chars
        case 3:
            s += "=";
            break; // One pad char
        default:
            throw new Error("Illegal base64url string!");
    }
    return Buffer.from(s, 'base64'); // Standard base64 decoder
}

function zeroBuffer(buff: Buffer): Buffer {
    for (let i = 0; i < buff.length; i++) buff[i] = 0;
    return buff;
}

function createKeys(secret: string): {
    encryptionKey: Buffer,
    signatureKey: Buffer
} {
    let encKeyHmac = crypto.createHmac('sha256', secret);
    encKeyHmac.update('session-encryption');
    const signKeyHmac = crypto.createHmac('sha256', secret);
    signKeyHmac.update('session-signature');
    return {
        encryptionKey: encKeyHmac.digest(),
        signatureKey: signKeyHmac.digest()
    }
}

type HmacData = string | Buffer | DataView

function computeHmac(signatureKey: Buffer, iv: HmacData, ciphertext: HmacData, createdAt: HmacData): Buffer {
    let hmac = crypto.createHmac('sha256', signatureKey);
    hmac.update(iv);
    hmac.update('.');
    hmac.update(ciphertext);
    hmac.update('.');
    hmac.update(createdAt);
    hmac.update('.');
    return hmac.digest();
}

function constantTimeEquals(a: Buffer, b: Buffer): boolean {
    if (a.length !== b.length) return false;
    var ret = 0;
    for (var i = 0; i < a.length; i++) {
        ret |= a.readUInt8(i) ^ b.readUInt8(i);
    }
    return ret === 0;
}

export function sessionToken(data: {}, createdAt: number, secret: string): string {
    let keys = createKeys(secret);
    let iv = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv('AES-256-CBC', keys.encryptionKey, iv);

    let ciphertextStart = cipher.update(Buffer.from(JSON.stringify(data), 'utf8'));
    let ciphertextEnd = cipher.final();

    let ciphertext = Buffer.concat([ciphertextStart, ciphertextEnd]);
    zeroBuffer(ciphertextEnd);
    zeroBuffer(ciphertextStart);

    let hmac = computeHmac(keys.signatureKey, iv, ciphertext, createdAt.toString());

    let result = [
        base64urlencode(iv),
        base64urlencode(ciphertext),
        createdAt,
        base64urlencode(hmac)
    ].join('.');

    zeroBuffer(iv);
    zeroBuffer(ciphertext);
    zeroBuffer(hmac);

    return result;
}

export function verifySessionToken(sessionToken: string, secret: string): { data: {}, createdAt: number } {
    let parts = sessionToken.split('.');
    if (parts.length !== 4) return null;

    function cleanup() {
        if (iv) zeroBuffer(iv);
        if (ciphertext) zeroBuffer(iv);
        if (hmac) zeroBuffer(iv);
        if (expectedHmac) zeroBuffer(expectedHmac);
        return result;
    }

    try {
        var iv = base64urldecode(parts[0]);
        var ciphertext = base64urldecode(parts[1]);
        var hmac = base64urldecode(parts[3]);
    } catch (ignored) {
        return cleanup();
    }

    if (iv.length !== 16) return cleanup();

    let keys = createKeys(secret);
    let createdAt = parseInt(parts[2], 10);
    let expectedHmac = computeHmac(keys.signatureKey, iv, ciphertext, createdAt.toString());

    if (!constantTimeEquals(hmac, expectedHmac)) return cleanup();

    let cipher = crypto.createDecipheriv('AES-256-CBC', keys.encryptionKey, iv);
    var plaintext = cipher.update(ciphertext, 'binary', 'utf8');
    plaintext += cipher.final('utf8');

    try {
        var result = {
            data: JSON.parse(plaintext),
            createdAt: createdAt
        }
    } catch (ignored) { }
    return cleanup();
}
