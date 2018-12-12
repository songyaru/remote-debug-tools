/**
 *
 * Author: songyaru | songyaru9@gmail.com
 * Date: 2018/7/5  上午11:35
 * @file server router homepage
 */

const getDeviceInfo = require('../../device_info').getDeviceInfo;

const getIpAddress = require('../utils/ip_address');

const getList = (data = [], isIos = false) => {
    const list = [];
    const json = data.json;
    const version = data.version;
    const pv = version && version['Protocol-Version'] || '1.2';
    for (let i = 0; i < json.length; i++) {
        let info = json[i];
        let socketUrl = info['webSocketDebuggerUrl'] || '';


        let socketHref = socketUrl.replace('ws://', '');
        let url = info['url'];
        let title = info['title'] || url || '';

        let cName = '';
        let type;
        url.replace(/(master|slaves)\.html$/, (_, t) => {
            type = t;
        });
        // 小程序
        if (type) {
            cName += 'smart ' + type;
            title = '智能小程序-' + type;
            if (isIos) {
                cName += ' disable';
            } else {
                let description = JSON.parse(info['description'] || '""');
                let isAttached = description['attached'];
                if (!isAttached && type === 'slaves') {
                    continue;
                }
            }
        }
        list.push('<li><a class="', cName, '" data-socket="', socketUrl,
            '" href="/devtools/inspector.html?ws=', socketHref, '&pv=', pv, '">', title, '</a></li>');
    }
    return list.join('');
};
const getAllString = (infoList = [], isIos = false) => {
    let ret = '';
    for (let i = 0; i < infoList.length; i++) {
        let list = getList(infoList[i], isIos);
        if (list) {
            ret += '<h3>' + (isIos ? infoList[i].deviceName : infoList[i].localPort) + '</h3><ul data-ios="' + isIos
                + '" data-port="' + infoList[i].port + '">' + list + '</ul>';
        }
    }
    return ret;
};
const routerHome = async ctx => {
    const json = await getDeviceInfo();
    let iosInfoList = json.ios || {};
    let androidInfoList = json.android || {};

    let iosString = getAllString(iosInfoList, true);
    let androidString = getAllString(androidInfoList);
    let ip = getIpAddress();
    ctx.response.body = `<!DOCTYPE html>
        <html lang="en">
        <head>
         <meta charset="utf-8">
         <meta name="viewport" content="width=device-width, initial-scale=1">
         <title>Webview Info</title>
         <link type="text/css" rel="stylesheet" href="home/home.css">
         <script>var ip = '${ip}';</script>
        </head>
        <body>
         <div id="app">
            <div id="ios" class="ios">${iosString}</div>
            <div id="android" class="android">${androidString}</div>
         </div>
         <script type="text/javascript" src="home/home.js"></script>
         <script type="text/javascript">
           
         </script>
        </body>
       </html>`;
};


module.exports = {
    'GET /': routerHome
};