#!/usr/bin/env node

/**
 *
 * Author: songyaru | songyaru9@gmail.com
 * Date: 2018/7/5  下午6:26
 * @file getSmartAppUrl
 */

const adbTools = require('adb-tools');
const webviewInfo = adbTools.webviewInfo;
const constant = require('./constant');

const httpServerPort = parseInt(process.env.PORT, 10) || constant['PORT'];
const webviewPrefix = process.env['PREFIX'] || constant['PREFIX'];

// 获取智能小程序 master 页面的 webSocketDebuggerUrl
const getMasterPageInfo = info => {
    return new Promise((resolve, reject) => {
        if (!info || !info['json']) {
            reject('没有获取到被调试的页面信息');
            return;
        }
        const json = info['json'];
        const port = info['port'];
        let masterWebSocket = '';
        for (let i = 0, len = json.length; i < len; i++) {
            const data = json[i];
            if (data.title === 'background') {
                masterWebSocket = (data.webSocketDebuggerUrl || '').replace(/^ws:\/\//, '');
                resolve({ws: masterWebSocket, port});
                return;
            }
        }
        reject('无法获取被调试页面的 webSocketDebuggerUrl');
    });
};

const filterMiniAppJson = json => {
    return json.filter(currentInfo => {
        let description = JSON.parse(currentInfo['description'] || '""');
        let isAttached = description['attached'];
        return !!isAttached;
    });
};

const filter = json => {
    // 智能小程序有可能出现假 webview ,所有的页面状态都是 attached = false ,需要过滤掉
    const miniApp = filterMiniAppJson(json);
    if (miniApp.length) {
        return json;
    } else {
        return [];
    }
};


const getSmartAppUrl = ({prefix = webviewPrefix, serverPort = httpServerPort, index = 0} = {}) => {
    return new Promise((resolve, reject) => {
        return webviewInfo({prefix, filter})
            .then(infoArrays => getMasterPageInfo(infoArrays[index]))
            .then(({ws, port}) => {
                let url = `http://localhost:${serverPort}/devtools/inspector.html?ws=${ws}&fport=${port}`;
                resolve({url, serverPort});
            })
            .catch(e => reject(e));
    });
};


module.exports = getSmartAppUrl;


