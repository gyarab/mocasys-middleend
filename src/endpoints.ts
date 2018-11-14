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

    constructor (result: QueryResult) {
        this.rows = result.rows;
        this.rowCount = result.rowCount;
        this.fields = result.fields;
    }
}

console.log('hello from endpoints!');
server.post('/qdb', (req, res, next) => {
    db.queryPromise(req.params['query_str'], req.params['data'], true)
        .then(result => {
            // Parse for client
            var response = new MiddleResponse(result);
            console.log(response);
            res.send(response);
        })
        .catch(error => {
            var serverError = new errors.BadRequest({
                info: {
                    params: req.params,
                    error: error.stack
                }
            }, error.stack);
            console.error(serverError);
            // TODO: How are we going to tell the client
            // which fields are wrong or which conditions
            // are not?
            if (isDev()) {
                // Return the error
                res.send(serverError);
            } else {
                // Silent failure
                res.send(400);
            }
        })
        .then(() => {
            return next();
        });
});
