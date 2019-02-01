// Authentication endpoints are located in endpoints.ts
// This file contains verifications ans such
import {server} from './main';

// Authentication
server.use((req, res, next) => {
    console.log(req.authorization);
    return next();
});
