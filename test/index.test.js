
// I have no idea how to stop the restify server.
// server.close() does not do anything.
after(() => {
    // Without this the final message from mocha is
    // not shown.
    setTimeout(() => {
        process.exit(0);
    }, 0);
});
