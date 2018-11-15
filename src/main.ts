import * as restify from 'restify';
import * as corsMiddleware from 'restify-cors-middleware';

export const server = restify.createServer();

export function isDev() {
    return process.env.NODE_ENV == 'development';
}

const cors = corsMiddleware({
    origins: ['*'], // TODO: Change before releasing
    allowHeaders: ['API-Token'],
    exposeHeaders: ['API-Token-Expiry']
});

server.use(cors.actual);
server.pre(restify.pre.sanitizePath());
server.use(restify.plugins.jsonBodyParser({ mapParams: true }));
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser({ mapParams: true }));
// server.use(restify.plugins.fullResponse());
server.use(restify.plugins.authorizationParser());

server.get('/ping', (req, res, next) => {
    res.header('Content-Type', 'text/plain');
    res.send('pong');
    return next();
});

import './endpoints'

server.listen(8080, 'localhost', () => {
    console.log('INFO: Node app is running at localhost:8080');
});
