import * as config from 'config';
import * as crypto from 'crypto';
import * as pg from 'pg';
import * as moment from 'moment';

const pgTypes = pg.types;
const DATATYPE_DATE = 1082;

function parseDate(val) {
    return val === null ? null : moment(val).format('YYYY-MM-DD')
};

pgTypes.setTypeParser(DATATYPE_DATE, function(val) {
    return val === null ? null : parseDate(val)
});

export const dbConfig = config.get('db');

export const middleendConfig = dbConfig['middleend'];
export const qdbConfig = dbConfig['qdb'];

const middleendPool = new pg.Pool(middleendConfig);
const qdbPool = new pg.Pool(qdbConfig);

function makeQuery(query_str: string, data: any[], rowMode: boolean): pg.QueryConfig {
    let query: pg.QueryConfig = {
        text: query_str,
        values: data
    }
    if (rowMode) {
        query['rowMode'] = 'array';
    }
    return query;
}

export function query(query_str: string, data: any[],
    callback: (err: Error, result: pg.QueryResult) => void, rowMode: boolean = true): pg.Query {
    let query = makeQuery(query_str, data, rowMode);
    return middleendPool.query(query, callback);
}

export function queryPromise(query_str: string, data: any[], rowMode: boolean = true): Promise<pg.QueryResult> {
    let query = makeQuery(query_str, data, rowMode);
    return middleendPool.query(query);
}

export function qdbQuery(user_id: number, query_str: string, data: any[],
    callback: (err: Error, result: pg.QueryResult) => void, rowMode: boolean = true): void {
    // Secret for session_user_set.
    crypto.randomBytes(16, (err: Error, buff: Buffer) => {
        if (err) {
            callback(err, null);
            return;
        }
        let loginKey = buff.toString('hex');

        // Checkout a client.
        qdbPool.connect((err: Error, client: pg.PoolClient, releaseClient: (release?: any) => void) => {
            if (err) {
                releaseClient();
                callback(err, null);
                return;
            }

            // Login.
            client.query('SELECT session_user_set($1, $2);', [user_id, loginKey],
                (err: Error, loginResult: pg.QueryResult) => {
                    if (err) {
                        releaseClient();
                        callback(err, null);
                        return;
                    }

                    // Henceforth, we are logged in.
                    // Execute user's query.
                    let userSetQuery = makeQuery(query_str, data, rowMode);
                    client.query(userSetQuery, (err: Error, sqlResult: pg.QueryResult) => {
                        // Logout regardless of the query's success.
                        client.query('SELECT session_logout($1);', [loginKey],
                            (err: Error, logoutResult: pg.QueryResult) => {
                                releaseClient();
                                if (err) console.error(err);
                            });

                        if (err) {
                            // Usually a permission error.
                            callback(err, null);
                        } else {
                            // Pass the results back.
                            callback(err, sqlResult);
                        }
                    });
                });
        })
    });
}
