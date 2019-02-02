import * as errors from 'restify-errors';
import * as pg from 'pg';
import * as db from './db';
import { server, serverConfig } from '.';
import { authRouter } from './auth/endpoints';

// This class mimics what is returned from postgres,
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

authRouter.applyRoutes(server, '/auth');

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

server.get('/ping', (req, res, next) => {
    res.header('Content-Type', 'text/plain');
    res.send('pong');
    return next();
});
