import * as db from './index';

export function userPasswordHash(username: string) {
    return db.queryPromise(
        'SELECT user_password_data.pw_hash, users_current.id, users_current.username ' +
        'FROM user_password_data ' +
        'INNER JOIN users_current ' +
        'ON user_password_data.id_user = users_current.id ' +
        'WHERE users_current.username = $1;', [username]);
}
