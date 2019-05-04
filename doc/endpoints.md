
# Endpoints of The Middleend

## GET /ping

This endpoint serves as an availability check.

```
HTTP/1.1 200 OK
Content-Type: text/plain

ping
```


## POST /qdb

Query Postgres DB.

### Request

This endpoints requires that the user is authenticated,
otherwise 401 Unauthorized is returned.
Authentication is done by sending a *Session Token* in
the Authorization header and scheme *Token*.
Client can obtain the *Session Token* by successfully
authenticating using **/auth/<method>**.

```
Authorization: Token <initialization vector>.<body>.<createdAt>.<hmac>
```

Query without additional data:

```json
{
  "query_str": "SELECT * FROM table;" // This field is required
}
```

Query with additional data:

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
      s"format": "text"
    },
  ]
}
```

### Errors

```json
{
  "code": "BadRequest",
  "message": "param.query_str.required"
}
```

This error is returned when the endpoint does not receive the *query_str* param.
The code field corresponds to the returned HTTP status unless there is
an error with the database (query syntax, nonexistent table, bad connection etc.),
in that case, the code field contains *DbError* instead.

```json
{
  "code": "BadRequest",
  "message": "relation \"table_name\" does not exist"
}

{
  "code": "BadRequest",
  "message": "connect ECONNREFUSED 127.0.0.1:5432"
}
```


## GET /auth

Returns all authentication methods and their availability.

### Response

```json
{
  "password": {
    "enabled": true,
    "url": "/auth/password"
  },
  "google": {
    "enabled": false,
    "url": "/auth/google"
  }
}
```

When *enabled=false*, POST to these authentication endpoints returns

```json
{
  "code": "BadRequest",
  "message": "auth.<method>.disabled"
}
```

And when not implemented:

```json
{
  "code": "BadRequest",
  "message": "auth.<method>.notImplemented"
}
```


## POST /auth/password

Authentication using a password.

### Request

Both fields are required.

```json
{
  "username": "tester1",
  "password": "1234567890"
}
```

### Response

When successful, 168 character long *Session Token* is returned:

```json
{
  "sessionToken": "<initialization vector>.<body>.<createdAt>.<hmac>",
  "expiresIn": ""
}
```

*expiresIn* is in milliseconds after *createdAt*.

### Errors

```json
{
  "code": "BadRequest",
  "message": "auth.password.failed"
}
```

This includes cases when there is any *DbError*
since this is not a user query (the user was not found etc.).


## PUT /auth/password

Change a user's password.

### Request

All fields shown are required. User does not have to authenticated
to change the password.

```json
{
  "username": "tester1",
  "currentPassword": "1234567890",
  "newPassword": "0987654321"
}
```

### Response

When successful, 200 is returned

### Errors

```json
{
  "code": "BadRequest",
  "message": "<message>"
}
```

The *message* param can contain **auth.password.change.failed** or
**auth.password.change.noChange** when *currentPassword* equals the *newPassword* or
**auth.password.param.newPassword.invalid** when *newPassword* is not good enough.

## POST /auth/reader

### Request

```json
{
  "card_id": "68656c6c6f20636f6d7075746572",
  "secret_key": "2756475707d6f63602f6c6c65686"
}
```

The *card_id* and *secret_key* are a hexadecimal string.

### Response

When successful, 168 character long *Session Token* is returned:

```json
{
  "sessionToken": "<initialization vector>.<body>.<createdAt>.<hmac>",
  "expiresIn": ""
}
```

*expiresIn* is in milliseconds after *createdAt*.

### Errors

```json
{
  "code": "BadRequest",
  "message": "auth.reader.failed"
}
```


## POST /auth/google - **Not implemented yet.**

Authentication using Google+.
