#!/usr/bin/env node

const path = require('path');
const program = require('commander');
const adbCommand = require('../command');
const constant = require('../constant');


function main() {
    program
        .version(require('../package.json').version)
        .usage('[options]')
        .option('-u, --upload', 'upload preload files to android')
        .option('-s, --start-server', 'start inspector server')
        .option('-p, --port [number]', 'set server port', constant['PORT'])
        .option('-f, --prefix [string]', 'debug webview type prefix', constant['PREFIX'])
        .option('-d, --server-dir [path]', 'the root path of inspector server', constant['SERVER_DIR'])
        .parse(process.argv);

    const options = {
        PORT: program['port'],
        PREFIX: program['prefix'],
        SERVER_DIR: path.resolve(__dirname, program['serverDir']),
    };


    for (let option in options) {
        process.env[option] = options[option];
    }

    let isSingleCommand = false;

    if (program.upload) {
        isSingleCommand = true;
        adbCommand.uploadPreload();
    }
    if (program.startServer) {
        isSingleCommand = true;

        adbCommand.startServer({
            prefix: process.env['PREFIX'],
            port: process.env['PORT']
        }).catch(e => console.log(e));
    }

    if (!isSingleCommand) {
        adbCommand.uploadPreload();
        adbCommand.start({
            prefix: process.env['PREFIX'],
            port: process.env['PORT']
        }).catch(e => console.log(e));
    }

}


main();

