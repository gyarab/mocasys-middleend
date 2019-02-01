import * as restify from 'restify';
import * as corsMiddleware from 'restify-cors-middleware';
import * as config from 'config';

export const serverConfig = config.get('server');
export const server = restify.createServer();

export function isDev() {
    return process.env.NODE_ENV == 'development';
}

const cors = corsMiddleware({
    origins: serverConfig['origins'],
    allowHeaders: ['API-Token'],
    exposeHeaders: ['API-Token-Expiry']
});

server.use(cors.actual);
server.pre(restify.pre.sanitizePath());
server.use(restify.plugins.jsonBodyParser({ mapParams: true }));
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser({ mapParams: true }));
server.use(restify.plugins.authorizationParser());

import './authentication'

if (serverConfig['logRequests']) {
    server.use((req, res, next) => {
        console.log(req);
        return next();
    });
}

import './endpoints'

server.listen(serverConfig['port'], 'localhost', () => {
    console.log(`INFO: Node app is running at localhost:${serverConfig['port']}`);
});
