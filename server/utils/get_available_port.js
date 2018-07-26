/**
 *
 * Author: songyaru | songyaru9@gmail.com
 * Date: 2018/7/5  下午2:26
 * @file check port can use
 */
const checkPort = require('./check_port');
let maxTryTimes = 100;
const getAvailablePort = p => {
    return new Promise((resolve, reject) => {
        maxTryTimes--;
        checkPort(p)
            .then(port => resolve(port))
            .catch(port => {
                if (maxTryTimes) {
                    return getAvailablePort(port + 1)
                        .then(p2 => resolve(p2))
                        .catch(p2 => reject(p2));
                } else {
                    reject(`try a lot of port ${port}`);
                }
            });
    });
};

module.exports = getAvailablePort;
