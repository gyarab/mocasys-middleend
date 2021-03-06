import * as config from 'config';
import * as corsMiddleware from 'restify-cors-middleware';
import * as restify from 'restify';
import * as renamer from './db/renamer';
import { validateSessionToken } from './auth';
import { masterRouter } from './endpoints';

console.log(`Config name: ${config.get('_desc')}`);
export const serverConfig = config.get('server');
export const server = restify.createServer();

export function isDev() {
    return process.env.NODE_ENV == 'development';
}

const cors = corsMiddleware({
    origins: serverConfig['origins'],
    allowHeaders: ['Authorization'],
    exposeHeaders: ['API-Token-Expiry']
});

server.pre(restify.pre.sanitizePath());
server.pre(cors.preflight);
server.use(cors.actual);
server.use(restify.plugins.jsonBodyParser({ mapParams: true }));
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser({ mapParams: true }));
server.use(validateSessionToken);

if (serverConfig['logRequests']) {
    server.use((req, res, next) => {
        console.log(new Date(), req.params);
        return next();
    });
}

masterRouter.applyRoutes(server, serverConfig['rootPath']);

function main() {
    server.listen(serverConfig['port'], 'localhost', () => {
        console.log(`INFO: Node app is running at localhost:${serverConfig['port']}`);
    });
}

function init() {
    renamer.init(main);
}

init();
