
import * as db from './index';
import * as pg from 'pg';

export function userPasswordHash(username: string, callback: (err: Error, result: pg.QueryResult) => void) {
    db.query('SELECT user_password_data.pw_hash ' +
        'FROM user_password_data ' +
        'INNER JOIN users_current ' +
        'ON user_password_data.id_user = users_current.id ' +
        'WHERE users_current.username = $1;', [username], true, callback);
}
