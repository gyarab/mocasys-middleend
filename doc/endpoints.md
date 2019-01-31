
# Endpoints of The Middleend

## GET /ping

This endpoints server as an availability check.

```
HTTP/1.1 200 OK
Content-Type: text/plain

ping
```

## POST /qdb

Post a json to get data from Postgres.

### Request's json body

Without additional data:
```json
{
    "query_str": "SELECT * FROM table;" // This field is required
}
```

With additional data:
```json
{
    "query_str": "SELECT * FROM table WHERE id = $1 OR id = $2;",
    "data": [42, 76] // When no data is required this field is optional.
}
```

### Response

```json
{
    "rows": [
        [1, "Adam", "Warlock", "2014-04-08T22:00:00.000Z"],
        [2, "Harry", "Potter", "1990-07-31T22:00:00.000Z"]
    ],
    "rowCount": 2,
    "fields": [
        {
            "name": "id",
            "tableID": 17249,
            "columnID": 1,
            "dataTypeID": 23,
            "dataTypeSize": 4,
            "dataTypeModifier": -1,
            "format": "text"
        },
        // ...
        {
            "name": "dateBorn",
            "tableID": 17249,
            "columnID": 4,
            "dataTypeID": 1082,
            "dataTypeSize": 4,
            "dataTypeModifier": -1,
            "format": "text"
        },
    ]
}
```

### Errors

Errors have the following structure:
```json
{
    "code": "BadRequest",
    "message": "field.query_str.required"
}
```

This error is returned when the endpoint does not receive the query_str param.
The code field corresponds to the returned HTTP status unless there is
an error with the database(query syntax, nonexistent table, bad connection etc.),
in that case, the code field contains 'DbError' instead.

```json
{
    "code": "DbError",
    "message": "relation \"table_name\" does not exist"
}

{
    "code": "DbError",
    "message": "connect ECONNREFUSED 127.0.0.1:5432"
}
```
