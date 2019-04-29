import * as pg from 'pg';
import * as renamer from './db/renamer';

interface MField {
    tableName: String;
    // TODO: Replace with columnName
    columnName: String;
    dataTypeName: String;
    dataTypeSize: Number;
    dataTypeModifier: Number;
    format: String;
}

function transformField(field: pg.FieldDef): MField {
    let newField = {
        tableName: renamer.tableName(field.tableID),
        columnName: field.name,
        dataTypeName: renamer.typeName(field.dataTypeID),
        dataTypeSize: field.dataTypeSize,
        dataTypeModifier: field.dataTypeModifier,
        format: field.format,
    }
    return newField;
}

function transformFields(fields: pg.FieldDef[]): Array<MField> {
    console.log(fields);
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
