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

let filterIosJson = json => {
    // 为了和 android 对齐
    json.map(data => {
        if (/slaves\.html$/.test(data['url']) && /-slave$/.test(data['title'])) {
            data['description'] = '{"attached":true}';
        }
    });
    return json;
};
const routerJson = async ctx => {
    let port = ctx.params.port | 0;
    let isIos = ctx.query.ios;
    ctx.set('Cache-Control', 'no-cache');
    if (port > 0) {
        await fetchForwardPort({port, filter: isIos ? filterIosJson : filterJson}).then(({json}) => {
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