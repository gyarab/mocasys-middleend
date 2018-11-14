import * as pg from 'pg';
import * as config from 'config';

const pgConfig = config.get('db');

function clientFactory() {
    return new pg.Client(pgConfig);
}

export default clientFactory;
