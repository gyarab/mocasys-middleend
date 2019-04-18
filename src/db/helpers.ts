import * as db from './index';
import * as pg from 'pg';

export function userPasswordHash(username: string): Promise<pg.QueryResult> {
    return db.queryPromise(
        'SELECT user_passwords_data.pw_hash, users_current.id, users_current.username ' +
        'FROM user_passwords_data ' +
        'INNER JOIN users_current ' +
        'ON user_passwords_data.id_user = users_current.id ' +
        'WHERE users_current.username = $1;', [username]);
}
