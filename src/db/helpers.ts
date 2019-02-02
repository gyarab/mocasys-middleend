
import * as db from './index';

export function userPasswordHash(username: string) {
    return db.queryPromise('SELECT user_password_data.pw_hash ' +
        'FROM user_password_data ' +
        'INNER JOIN users_current ' +
        'ON user_password_data.id_user = users_current.id ' +
        'WHERE users_current.username = $1;', [username], true);
}
