"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var restify = require("restify");
var corsMiddleware = require("restify-cors-middleware");
exports.server = restify.createServer();
var cors = corsMiddleware({
    origins: ['*'],
    allowHeaders: ['API-Token'],
    exposeHeaders: ['API-Token-Expiry']
});
exports.server.use(cors.actual);
exports.server.pre(restify.pre.sanitizePath());
exports.server.use(restify.plugins.jsonBodyParser({ mapParams: true }));
exports.server.use(restify.plugins.acceptParser(exports.server.acceptable));
exports.server.use(restify.plugins.queryParser({ mapParams: true }));
// server.use(restify.plugins.fullResponse());
exports.server.use(restify.plugins.authorizationParser());
exports.server.get('/hello', function (req, res, next) {
    res.send("Hello, World!");
});
exports.server.listen(8080, 'localhost', function () {
    console.log('INFO: Node app is running at localhost:8080');
});
//# sourceMappingURL=main.js.map