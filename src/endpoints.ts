import { server, serverConfig } from './main';
import * as db from './db';
import * as errors from 'restify-errors';
import * as pg from 'pg';
import * as authentication from './authentication';
import * as assert from 'assert'
import * as dbHelpers from './db/helpers';

// This class mimics what is returned from postgre,
// but we do not want to pass all the data.
// Field implements FieldDef which is from module pg.
class MiddleResponse {
    rows: any[][];
    rowCount: number;
    fields: pg.FieldDef[];

    constructor(result: pg.QueryResult) {
        this.rows = result.rows;
        this.rowCount = result.rowCount;
        this.fields = result.fields;
    }
}

let DbError = errors.makeConstructor('DbError', {
    restCode: "DbError",
    statusCode: 500,
});

server.post('/qdb', (req, res, next) => {
    if (req.params['query_str']) {
        db.queryPromise(req.params['query_str'], req.params['data'], true)
            .then(result => {
                // Parse for client
                let response = new MiddleResponse(result);
                res.send(response);
            })
            .catch(error => {
                let badRequest = new DbError({
                    info: {
                        params: req.params,
                        error: error.message
                    }
                }, error.message);
                res.send(badRequest);
            })
            .then(() => {
                return next();
            });
    } else {
        let badRequest = new errors.BadRequestError({}, 'param.query_str.required');
        res.send(badRequest);
        return next();
    }
});

server.get('/auth', (req, res, next) => {
    let response = {};
    for (let method in serverConfig['authentication']) {
        response[method] = {
            enabled: serverConfig['authentication'][method],
            url: `${req.url}/${method}`
        };
    }
    res.send(response);
    return next();
});

// TODO: Handle Errors
// TODO: Send Auth-Token on success
server.post('/auth/password', (req, res, next) => {
    if (!serverConfig['authentication']['password']) {
        res.send(new errors.BadRequestError({}, 'auth.password.disabled'));
        return next();
    }
    if (req.params['username'] && req.params['password']) {
        // Fetch db
        dbHelpers.userPasswordHash(req.params['username'], (err: Error, result: pg.QueryResult) => {
            let saltDerivedKey = result.rows[0][0].split(':');
            let salt = Buffer.from(saltDerivedKey[0], 'hex');
            let derivedKey = Buffer.from(saltDerivedKey[1], 'hex');
            // Verify
            authentication.verifyHashSalt(req.params['password'], salt, derivedKey, (result: boolean) => {
                res.send({ success: result });
                return next();
            });
        });
    } else {
        var messages = [];
        if (!req.params['username']) messages.push('param.username.required');
        if (!req.params['password']) messages.push('param.password.required');
        assert(messages.length > 0);
        res.send(new errors.BadRequestError({}, messages.join(',')));
    }
    return next();
});

server.post('/auth/google', (req, res, next) => {
    if (!serverConfig['authentication']['google']) {
        res.send(new errors.BadRequestError({}, 'auth.google.disabled'));
    } else {
        res.send(new errors.BadRequestError({}, 'auth.google.notImplemented'));
    }
    return next();
});

server.get('/ping', (req, res, next) => {
    res.header('Content-Type', 'text/plain');
    res.send('pong');
    return next();
});
