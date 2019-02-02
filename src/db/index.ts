import * as config from 'config';
import * as pg from 'pg';

const pgConfig = config.get('db');
const pool = new pg.Pool(pgConfig);

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
    return pool.query(query, callback);
}

export function queryPromise(query_str: string, data: any[], rowMode: boolean = true): Promise<pg.QueryResult> {
    let query = makeQuery(query_str, data, rowMode);
    return pool.query(query);
}

export function userQuery(user_id: number, query_str: string, data: any[],
    callback: (err: Error, result: pg.QueryResult) => void, rowMode: boolean = true): void {
    let client = new pg.Client(pgConfig);
    client.connect();
    let userSetQuery = makeQuery(`SELECT session_user_set($1);`, [3], true);
    client.query(userSetQuery, (err: Error, result: pg.QueryResult) => {
        if (err) {
            callback(err, null);
        } else {
            let query = makeQuery(query_str, data, rowMode);
            client.query(query, callback);
        }
    });
}
