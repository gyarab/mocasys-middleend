import * as db from './index';
import * as pg from 'pg';

function decodeFunctionCall(s: string, enc: string = 'hex') {
    return `decode(${s}, '${enc}')`;
}

export function userPasswordHash(username: string): Promise<pg.QueryResult> {
    return db.queryPromise(
        'SELECT user_passwords_data.pw_hash, users_current.id, users_current.username ' +
        'FROM user_passwords_data ' +
        'INNER JOIN users_current ' +
        'ON user_passwords_data.id_user = users_current.id ' +
        'WHERE users_current.username = $1;', [username]
    );
}

export function changeUserPasswordHash(user_id: number, newHash: string) {
    return db.queryPromise(
        'UPDATE user_passwords_data ' +
        'SET pw_hash = $2' +
        'WHERE id_user = $1;', [user_id, newHash]
    );
}

export function cardIdAndSecretKey(card_id, secret_key): Promise<pg.QueryResult> {
    return db.queryPromise(
        'SELECT user_mifare_cards_current.id_user FROM user_mifare_cards_current ' +
        `WHERE user_mifare_cards_current.card_id = ${decodeFunctionCall('$1')} ` +
        `AND user_mifare_cards_current.secret_key = ${decodeFunctionCall('$2')};`,
        [card_id, secret_key]
    );
}
