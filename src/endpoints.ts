import * as errors from 'restify-errors';
import * as pg from 'pg';
import * as db from './db';
import { MiddleResponse } from './middleResponse';
import { authRouter } from './auth/endpoints';
import { Router } from 'restify-router';
import { response } from 'spdy';

export const masterRouter = new Router();

// This class mimics what is returned from postgres,
// but we do not want to pass all the data.
// Field implements FieldDef which is from module pg.

let DbError = errors.makeConstructor('DbError', {
    restCode: "DbError",
    statusCode: 500,
});

masterRouter.add('/auth', authRouter);

masterRouter.post('/qdb', (req, res, next) => {
    if (!req['sessionToken']) {
        res.send(new errors.UnauthorizedError());
        return next();
    } else if (!req.params['query_str']) {
        res.send(new errors.BadRequestError({}, 'param.query_str.required'));
        return next();
    }
    db.qdbQuery(req['sessionToken']['data']['id'], req.params['query_str'], req.params['data'],
        (error: Error, result: pg.QueryResult) => {
            if (error) {
                // The error is most likely the client's fault
                res.send(new errors.BadRequestError(error.message));
            } else {
                // Parse for client
                console.log(result);
                if (Array.isArray(result)) {
                    let responses = new Array(result.length);
                    for (let i = 0; i < result.length; i++)
                        responses[i] = new MiddleResponse(result[i]);
                    res.send(responses);
                } else {
                    res.send(new MiddleResponse(result));
                }
            }
            return next();
        });
});

masterRouter.get('/ping', (req, res, next) => {
    res.header('Content-Type', 'text/plain');
    res.send('pong');
    return next();
});
