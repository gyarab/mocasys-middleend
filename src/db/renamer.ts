import * as db from './index';

const typeQuery = 'SELECT oid, typname FROM pg_type;'
const tableNamesQuery = 'SELECT oid, relname FROM pg_class;';

// id: Number -> name: String
var tableNames = {}
var columnNames = {}
var typeNames = {}

function isInitialized(): Boolean {
    return Object.keys(typeNames).length > 0 && Object.keys(tableNames).length > 0 ;
}

function getUsingKey(id: Number, obj: Object, defaultValue: String = ""): String {
    let key = id.toString();
    if (key in obj) return obj[key];
    return defaultValue;
}

export function typeName(id: Number): String {
    return getUsingKey(id, typeNames);
}

// TODO: Finish
function columnName(id: Number): String {
    return getUsingKey(id, columnNames);
}

export function tableName(id: Number): String {
    return getUsingKey(id, tableNames);
}

export function init(callback: () => any) {
    if (isInitialized()) return;
    db.query(typeQuery, [], (err: Error, resultTypes) => {
        // + column names
        db.query(tableNamesQuery, [], (err: Error, resultTableNames) => {
            let rows = resultTableNames.rows;
            for (let i = 0; i < rows.length; i++) {
                let dp = rows[i];
                tableNames[dp[0]] = dp[1];
            }
        });
        let rows = resultTypes.rows;
        for (let i = 0; i < rows.length; i++) {
            let dp = rows[i];
            typeNames[dp[0]] = dp[1];
        }
        callback();
    });
}
