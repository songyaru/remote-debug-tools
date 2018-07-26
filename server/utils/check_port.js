/**
 *
 * Author: songyaru | songyaru9@gmail.com
 * Date: 2018/7/5  下午2:26
 * @file check port
 */
const http = require('http');
const checkPort = port => {
    return new Promise((resolve, reject) => {
        port = port | 0;
        let server = http.createServer().listen(port);
        let hasCalled = false;
        let timeoutRef = setTimeout(function () {
            hasCalled = true;
            reject(port);
        }, 2000);
        timeoutRef.unref();
        server.on('listening', function () {
            clearTimeout(timeoutRef);
            if (server) {
                server.close();
            }
            if (!hasCalled) {
                hasCalled = true;
                resolve(port);
            }
        });
        server.on('error', function (err) {
            clearTimeout(timeoutRef);
            let result = true;
            if (err.code === 'EADDRINUSE') {
                result = false;
            }
            if (!hasCalled) {
                hasCalled = true;
                result ? resolve(port) : reject(port);
            }
        });
    });
};

module.exports = checkPort;
