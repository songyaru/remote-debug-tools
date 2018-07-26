/**
 *
 * Author: songyaru | songyaru9@gmail.com
 * Date: 2018/7/5  上午11:35
 * @file server router get json url
 */
const adbTools = require('adb-tools');
const fetchForwardPort = adbTools.fetchForwardPort;

const filterMiniAppJson = json => {
    return json.filter(currentInfo => {
        let description = JSON.parse(currentInfo['description'] || '""');
        let isAttached = description['attached'];
        return !!isAttached;
    });
};
let filterJson = data => data;
const routerJson = async ctx => {
    let port = ctx.params.port | 0;
    ctx.set('Cache-Control', 'no-cache');
    if (port > 0) {
        await fetchForwardPort({port, filter: filterJson}).then(({json}) => {
            ctx.response.type = 'json';
            ctx.response.body = json;

        }).catch(error => {
            console.log('代理 json port error: ', error);
            ctx.response.body = 'port ' + port + ' no response';
        });
    }
};
module.exports = {
    'GET /json/:port': routerJson,
    'GET /json': routerJson
};