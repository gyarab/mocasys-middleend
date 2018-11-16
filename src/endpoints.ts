import { server, isDev } from './main';
import * as db from './db';
import * as errors from 'restify-errors';
import { QueryResult, FieldDef } from 'pg';

// This class mimics what is returned from postgre,
// but we do not want all the data to be passed.
// Field implements FieldDef which is from pg.
class MiddleResponse {
    rows: any[][];
    rowCount: number;
    fields: FieldDef[];

    constructor(result: QueryResult) {
        this.rows = result.rows;
        this.rowCount = result.rowCount;
        this.fields = result.fields;
    }
}

server.post('/qdb', (req, res, next) => {
    if (req.params['query_str']) {
        db.queryPromise(req.params['query_str'], req.params['data'], true)
            .then(result => {
                // Parse for client
                var response = new MiddleResponse(result);
                console.log(response);
                res.send(response);
            })
            .catch(error => {
                var badRequest = new errors.BadRequestError({
                    info: {
                        params: req.params,
                        error: error.message
                    }
                }, error.message);
                console.info(badRequest);
                res.send(badRequest);
            })
            .then(() => {
                return next();
            });
    } else {
        var badRequest = new errors.BadRequestError({},
            'field.query_str.required');
        console.info(badRequest);
        res.send(badRequest);
        return next();
    }
});
