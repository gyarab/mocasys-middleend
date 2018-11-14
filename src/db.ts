import * as pg from 'pg';
import * as config from 'config';

const pgConfig = config.get('db');
export const pool = new pg.Pool(pgConfig);

function makeQuery(query_str: string, data: any[], rowMode: boolean): pg.QueryConfig {
    var q: pg.QueryConfig = {
        text: query_str,
        values: data
    }
    if (rowMode) {
        q['rowMode'] = 'array';
    }
    return q;
}

export function query(query_str: string, data: any[], rowMode: boolean = true,
    callback: (err: Error, result: pg.QueryResult) => void): pg.Query {
    var q = makeQuery(query_str, data, rowMode);
    return pool.query(q, callback);
}

export function queryPromise(query_str: string, data: any[], rowMode: boolean = true) {
    var q = makeQuery(query_str, data, rowMode);
    return pool.query(q);
}
