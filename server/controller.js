/**
 *
 * Author: songyaru | songyaru9@gmail.com
 * Date: 2018/7/5  下午12:42
 * @file server router
 */

const fs = require('fs');

const addMapping = (router, mapping) => {
    let path;
    for (let url in mapping) {
        if (url.startsWith('GET ')) {
            path = url.substring(4);
            router.get(path, mapping[url]);
        } else if (url.startsWith('POST ')) {
            path = url.substring(5);
            router.post(path, mapping[url]);
        } else {
            console.log(`invalid URL: ${url}`);
        }
    }
};

const addControllers = (router, dir) => {
    const files = fs.readdirSync(__dirname + '/' + dir);
    const routerFiles = files.filter(f => {
        return f.endsWith('.js');
    });

    for (let routerFile of routerFiles) {
        let mapping = require(__dirname + '/controllers/' + routerFile);
        addMapping(router, mapping);
    }
};

module.exports = (dir = 'controllers') => {
    let router = require('koa-router')();
    addControllers(router, dir);
    return router.routes();
};