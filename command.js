const path = require('path');
const os = require('os');
const childProcess = require('child_process');
const constant = require('./constant');
const adbTools = require('adb-tools');
const chromeLauncher = require('chrome-launcher');

const getAvailablePort = require('./server/utils/get_available_port');

const uploadPreload = ({cwd = __dirname, adb = './node_modules/adb-tools/bin'} = {}) => {
    let adbPath = '';
    if (os.platform() === 'darwin') {
        adbPath = 'adb-macos';
    } else {
        adbPath = 'adb-win';
    }
    childProcess.exec(path.join(adb, adbPath, 'adb') + ' push ./preload/* /sdcard/', {cwd}, (error, stdout) => {
        if (error !== null) {
            console.log('exec error: ' + error);
        } else {
            console.log('   upload preload files: ', stdout);
        }
    });
};


let server;
let chrome;
const kill = () => {
    server && server.close && server.close();
    server && server.kill && server.kill();
    chrome && chrome.kill();
};

const consoleMessage = message => {
    console.log('======' + message);
};

const startServer = ({cwd = __dirname, port = process.env['PORT'] | 0 || constant['PORT']} = {}) => {
    return new Promise((resolve, reject) => {
        return getAvailablePort(port).then(serverPort => {
            process.env['PORT'] = serverPort;
            server = childProcess.fork(path.join(cwd, './server/index.js'), {
                env: process.env
            });
            resolve({server, serverPort});
        }).catch(e => reject(e));
    });
};


const startChrome = ({url, flags = []} = {}) => {
    return chromeLauncher.launch({
        // chromePath: '/Applications/Chromium.app/Contents/MacOS/Chromium',
        // startingUrl: url,
        chromeFlags: ['--app=' + url, ...flags]
    });
};

const getSmartAppUrl = require('./get_smart_app_url');

const start = ({
                   cwd = __dirname,
                   port = process.env['PORT'] | 0 || constant['PORT'],
                   prefix = process.env['PREFIX'] || constant['PREFIX'],
                   autoStart = true,
               } = {}) => {
    return new Promise((resolve, reject) => {
        return startServer({cwd, port}).then(({server, serverPort}) => {
            // reverse adb port for inspector-master websocket connect

            // todo 手机端的 8090 固定，因为 preload 的 socket 连接端口写死了
            adbTools.reversePort(8090, serverPort).catch(e => reject(e));

            const getUrlPromise = getSmartAppUrl({prefix, serverPort});
            if (!autoStart) {
                return getUrlPromise.then(({url}) => resolve({server, serverPort, url}));
            } else {
                return getUrlPromise
                    .then(({url}) => startChrome({url}))
                    .then(c => {
                        chrome = c;
                        chrome.process.on('exit', function () {
                            server && server.kill();
                        });
                        resolve({pid: chrome.pid});
                    })
            }
        }).catch(error => {
            reject(error);
        });
    });

};

module.exports = {
    uploadPreload, startServer, start, startChrome, getSmartAppUrl, kill
};




