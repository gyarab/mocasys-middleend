import * as assert from 'assert';
import * as errors from 'restify-errors';
import { Router } from 'restify-router';
import { serverConfig } from '..';
import * as auth from '.';
import * as dbHelpers from '../db/helpers';

export let authRouter = new Router();

function preAuthGen(methodName: String) {
    function preAuth(req, res, next) {
        if (!serverConfig['authentication'][methodName]) {
            res.send(new errors.BadRequestError({}, `auth.${methodName}.disabled`));
            return next(false);
        } else if (req['sessionToken']) {
            res.send(new errors.BadRequestError({}, 'auth.alreadyAuthorized'))
            return next(false);
        }
        return next();
    }
    return preAuth;
}

authRouter.get('', (req, res, next) => {
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

authRouter.post('/password', preAuthGen('password'), (req, res, next) => {
    if (!req.params['username'] || !req.params['password']) {
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
            // If sqlResult.rowCount == 0 error is thrown and it is caught
            let hashSalt: string = sqlResult.rows[0][0];
            // Verify
            auth.verifyHashSalt(req.params['password'], hashSalt,
                (err: Error, result: boolean) => {
                    if (err) {
                        res.send(new errors.InternalServerError({}, 'auth.password.failed'));
                    } else if (result) {
                        let sessionToken = auth.createSessionToken({
                            id: sqlResult.rows[0][1],
                            username: sqlResult.rows[0][2],
                            method: 'password',
                        }, new Date().getTime());
                        res.send({
                            sessionToken: sessionToken,
                        });
                    } else {
                        res.send(new errors.BadRequestError({}, 'auth.password.failed'));
                    }
                    return next();
                }
            );
        })
        .catch(error => {
            console.error(error);
            res.send(new errors.InternalServerError({}, 'auth.password.failed'));
        });
});

authRouter.post('/google', preAuthGen('google'), (req, res, next) => {
    res.send(new errors.BadRequestError({}, 'auth.google.notImplemented'));
    return next();
});

authRouter.post('/reader', preAuthGen('reader'), (req, res, next) => {
    res.send(new errors.BadRequestError({}, 'auth.reader.notImplemented'));
    return next();
});
