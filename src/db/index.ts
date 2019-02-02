import * as config from 'config';
import * as pg from 'pg';

const pgConfig = config.get('db');
export const pool = new pg.Pool(pgConfig);

function makeQuery(query_str: string, data: any[], rowMode: boolean): pg.QueryConfig {
    var query: pg.QueryConfig = {
        text: query_str,
        values: data
    }
    if (rowMode) {
        query['rowMode'] = 'array';
    }
    return query;
}

export function query(query_str: string, data: any[], rowMode: boolean = true,
    callback: (err: Error, result: pg.QueryResult) => void): pg.Query {
    var query = makeQuery(query_str, data, rowMode);
    return pool.query(query, callback);
}

export function queryPromise(query_str: string, data: any[], rowMode: boolean = true) {
    var query = makeQuery(query_str, data, rowMode);
    return pool.query(query);
}
