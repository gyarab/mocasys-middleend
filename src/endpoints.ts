import * as assert from 'assert'
import * as errors from 'restify-errors';
import * as pg from 'pg';
import * as auth from './auth';
import * as db from './db';
import * as dbHelpers from './db/helpers';
import { server, serverConfig } from '.';

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
    if (!req['sessionToken']) {
        res.send(new errors.UnauthorizedError());
        return next();
    } else if (!req.params['query_str']) {
        res.send(new errors.BadRequestError({}, 'param.query_str.required'));
        return next();
    }
    db.userQuery(req['sessionToken']['data']['id'], req.params['query_str'], req.params['data'],
        (error: Error, result: pg.QueryResult) => {
            if (error) {
                let dbError = new DbError({
                    info: {
                        params: req.params,
                        error: error.message
                    }
                }, error.message);
                res.send(dbError);
            } else {
                // Parse for client
                res.send(new MiddleResponse(result));
            }
            return next();
        });
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

server.post('/auth/password', (req, res, next) => {
    if (!serverConfig['authentication']['password']) {
        res.send(new errors.BadRequestError({}, 'auth.password.disabled'));
        return next();
    } else if (req['sessionToken']) {
        res.send(new errors.BadRequestError({}, 'auth.already.authorized'))
        return next();
    } else if (!req.params['username'] || !req.params['password']) {
        var messages = [];
        if (!req.params['username']) messages.push('param.username.required');
        if (!req.params['password']) messages.push('param.password.required');
        assert(messages.length > 0);
        res.send(new errors.BadRequestError({}, messages.join(',')));
        return next();
    }
    // Fetch db
    dbHelpers.userPasswordHash(req.params['username'])
        .then(sqlResult => {
            let saltDerivedKey = sqlResult.rows[0][0].split(':');
            let salt = Buffer.from(saltDerivedKey[0], 'hex');
            let derivedKey = Buffer.from(saltDerivedKey[1], 'hex');
            // Verify
            auth.verifyHashSalt(req.params['password'], salt, derivedKey,
                (result: boolean) => {
                    if (result) {
                        var sessionToken = auth.createSessionToken({
                            id: sqlResult.rows[0][1],
                            username: sqlResult.rows[0][2],
                            method: 'password'
                        }, new Date().getTime());
                        res.send({
                            sessionToken: sessionToken
                        });
                    } else {
                        res.send(new errors.BadRequestError({}, 'auth.password.failed'));
                    }
                }
            );
        })
        .catch(error => {
            res.send(new errors.BadRequestError({}, 'auth.password.failed'));
        }).then(() => {
            return next();
        });
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
