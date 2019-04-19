import * as errors from 'restify-errors';
import { Router } from 'restify-router';
import { serverConfig } from '..';
import * as auth from '.';
import * as dbHelpers from '../db/helpers';
import * as helpers from '../helpers';
import { MiddleResponse } from '../middleResponse';

export let authRouter = new Router();

function preAuthGen(methodName: string, requiredParams: Array<string>) {
    function preAuth(req, res, next) {
        if (!serverConfig['authentication'][methodName]) {
            res.send(new errors.BadRequestError({}, `auth.${methodName}.disabled`));
            return next(false);
        } else if (req['sessionToken']) {
            res.send(new errors.BadRequestError({}, 'auth.alreadyAuthorized'))
            return next(false);
        }
        let errMessages = helpers.requireParams(req.params, 'param', true, requiredParams);
        if (errMessages.length > 0) {
            return helpers.sendErrorsNext(res, errMessages, next);
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

authRouter.post('/password', preAuthGen('password', ['username', 'password']), (req, res, next) => {
    // Fetch db
    dbHelpers.userPasswordHash(req.params['username'])
        .then(sqlResult => {
            // If sqlResult.rowCount == 0, error is thrown and it is caught
            let hashSalt: string = sqlResult.rows[0][0];
            // Verify
            auth.verifyHashSalt(req.params['password'], hashSalt,
                (err: Error, result: boolean) => {
                    if (err) {
                        res.send(new errors.InternalServerError({}, 'auth.password.failed'));
                    } else if (result) {
                        let sessionToken = auth.createSessionToken({
                            id: sqlResult.rows[0][1],  // id_user
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
            res.send(new errors.BadRequestError({}, 'auth.password.failed'));
            return next(error);
        });
});

authRouter.post('/google', preAuthGen('google', []), (req, res, next) => {
    res.send(new errors.BadRequestError({}, 'auth.google.notImplemented'));
    return next();
});

authRouter.post('/reader', preAuthGen('reader', ['card_id', 'secret_key']), (req, res, next) => {
    let card_id = req.params.card_id;
    let secret_key = req.params.secret_key;
    dbHelpers.cardIdAndSecretKey(card_id, secret_key)
        .then(sqlResult => {
            if (sqlResult.rowCount === 0) {
                res.send(new errors.NotFoundError({}));
            } else {
                let sessionToken = auth.createSessionToken({
                    id: sqlResult.rows[0][0], // id_user
                    method: 'reader',
                }, new Date().getTime());
                res.send({
                    sessionToken: sessionToken,
                });
            }
            return next();
        })
        .catch(error => {
            console.error(error);
            res.send(new errors.BadRequestError({}, 'auth.reader.failed'));
            return next(error);
        });
});
