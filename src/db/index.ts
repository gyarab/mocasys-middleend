import * as config from 'config';
import * as crypto from 'crypto';
import * as pg from 'pg';

const pgConfig = config.get('db');

const middleendConfig = pgConfig['middleend'];
const qdbConfig = pgConfig['qdb'];

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
    // Secret for session_user_set
    crypto.randomBytes(16, (err: Error, buff: Buffer) => {
        if (err) {
            callback(err, null);
            return;
        }
        let loginKey = buff.toString('hex');
        // Checkout a client
        qdbPool.connect((err: Error, client: pg.PoolClient, done: (release?: any) => void) => {
            if (err) {
                callback(err, null);
                return;
            }
            // Select the user
            client.query('SELECT session_user_set($1, $2);', [user_id, loginKey],
                (err: Error, sqlResult: pg.QueryResult) => {
                    if (err) {
                        done();
                        callback(err, null);
                        return;
                    }
                    // Execute user's query
                    let userSetQuery = makeQuery(query_str, data, rowMode);;
                    client.query(userSetQuery, (err: Error, result: pg.QueryResult) => {
                        if (err) {
                            done();
                            callback(err, null);
                            return;
                        }
                        // Logout
                        client.query('SELECT session_logout($1);', [loginKey], (err: Error, result: pg.QueryResult) => {
                            done();
                            if (err) {
                                callback(err, null);
                                return;
                            }
                            // Pass the results back
                            callback(err, result);
                        })
                    });
                });
        })
    });
}
