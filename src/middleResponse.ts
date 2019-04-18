import * as pg from 'pg';

export class MiddleResponse {
    rows: any[][];
    rowCount: number;
    fields: pg.FieldDef[];

    constructor(result: pg.QueryResult) {
        this.rows = result.rows;
        this.rowCount = result.rowCount;
        this.fields = result.fields;
    }
}
