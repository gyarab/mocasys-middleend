import server from './main'
import clientFactory from './db'

console.log('hello from endpoints!');
server.get('/qdb', (req, res, next) => {
    const client = clientFactory();
    client.connect().then(() => {
        client.query('SELECT * FROM payments_invoice', (err, qres) => {
            if (err) {
                console.log(err.stack);
                res.send(err.stack);
            } else {
                console.log(qres)
                res.send(qres.rows);
            }
            client.end()
            return next();
        })
    })
});
