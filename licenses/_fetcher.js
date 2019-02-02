const checker = require('npm-license');
const fs = require('fs');
const https = require('https');
const request = require('request');

// It may be neccessary to run this file multiple times
const licenseFiles = [
    'LICENSE', 'LICENSE.txt', 'LICENSE.md',
    'LICENCE', 'LICENCE.txt', 'LICENCE.md',
]

const extra = [
    { name: 'Typescript', repository: 'https://github.com/Microsoft/TypeScript' },
    { name: 'ts-node', repository: 'https://github.com/TypeStrong/ts-node' },
    { name: 'jest', repository: 'https://github.com/facebook/jest' },
    { name: 'nodemon', repository: 'https://github.com/remy/nodemon' },
    { name: 'tslint', repository: 'https://github.com/palantir/tslint' },
    { name: 'node', repository: 'https://github.com/nodejs/node' }
]

function urlToRaw(url, file) {
    let path = url.replace('https://github.com/', '');
    let urlRaw = `https://raw.githubusercontent.com/${path}/master/${file}`;
    return urlRaw;
}

function urlExists(name, url, callback) {
    for (let i in licenseFiles) {
        let urlLicense = urlToRaw(url, licenseFiles[i]);
        request({ method: 'HEAD', uri: urlLicense }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callback(name, urlLicense);
            }
        })
    }
}

function download(name, source) {
    let fname = `licenses/${name.replace('/', '-').replace(/[@]/g, '')}-LICENSE`;
    if (fs.existsSync(fname)) return;
    fs.closeSync(fs.openSync(fname, 'w'));
    let file = fs.createWriteStream(fname);
    https.get(source, function (response) {
        console.log(fname);
        response.pipe(file);
    });
}

for (let i in extra) {
    let project = extra[i];
    urlExists(project.name, project.repository, download);
}

checker.init({
    start: '.',
    depth: 'all',
    include: 'dependencies'
}, function (json) {
    for (let pack in json) {
        if (json[pack]['repository']) {
            urlExists(pack, json[pack]['repository'], download);
        }
    }
});
