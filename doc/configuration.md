
# Configuration of The Middleend

Configuration is managed by the *config* package
(https://www.npmjs.com/package/config) and is placed
by default in the /config directory.

The settings are self-explanatory.

## Production

In production set the **NODE_ENV** environment variable to
*production*.

## Overriding With Environment Variables

One might want to put some settings (e.g. db credentials)
in an environment variable like so:

```bash
$ export NODE_CONFIG='{"server":{"port":9000}, "db":{"password":"bar"}}'
```

Or:

```bash
$ node app.js --NODE_CONFIG='{"server":{"port":9000}, "db":{"password":"bar"}}'
```

These settings will override those in the config files.

For more details or advanced stuff visit:
https://github.com/lorenwest/node-config/wiki/Environment-Variables.
