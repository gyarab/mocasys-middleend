import * as pg from 'pg';
import * as renamer from './db/renamer';

interface MField {
    name: String;
    tableName: String;
    // TODO: Replace with columnName
    columnID: Number;
    dataTypeName: String;
    dataTypeSize: Number;
    dataTypeModifier: Number;
    format: String;
}

function transformField(field: pg.FieldDef): MField {
    let newField = {
        name: field.name,
        tableName: renamer.tableName(field.tableID),
        columnID: field.columnID,
        dataTypeName: renamer.typeName(field.dataTypeID),
        dataTypeSize: field.dataTypeSize,
        dataTypeModifier: field.dataTypeModifier,
        format: field.format,
    }
    console.log(newField);
    return newField;
}

function transformFields(fields: pg.FieldDef[]): Array<MField> {
    let parsedFields = new Array<MField>(fields.length);
    for (let i = 0; i < fields.length; i++) {
        parsedFields[i] = transformField(fields[i]);
    }
    return parsedFields;
}

export class MiddleResponse {
    rows: any[][];
    rowCount: number;
    fields: MField[];

    constructor(result: pg.QueryResult) {
        this.rows = result.rows;
        this.rowCount = result.rowCount;
        this.fields = transformFields(result.fields);
    }
}
