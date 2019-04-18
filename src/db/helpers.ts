import * as db from './index';
import * as pg from 'pg';

export function userPasswordHash(username: string): Promise<pg.QueryResult> {
    return db.queryPromise(
        'SELECT user_passwords_data.pw_hash, users_current.id, users_current.username ' +
        'FROM user_passwords_data ' +
        'INNER JOIN users_current ' +
        'ON user_passwords_data.id_user = users_current.id ' +
        'WHERE users_current.username = $1;', [username]
    );
}

export function cardIdAndSecretKey(card_id, secret_key): Promise<pg.QueryResult> {
    return db.queryPromise(
        // TODO: Select data from food_choice_current - diners_current - users_current - user_mifare_cards_current
        'SELECT * FROM user_mifare_cards_current ' +
        'WHERE user_mifare_cards_current.card_id = $1 ' +
        'AND user_mifare_cards_current.secret_key = $2;',
        [card_id, secret_key]
    );
}
