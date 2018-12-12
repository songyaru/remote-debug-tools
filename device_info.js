/**
 *
 * Author: songyaru | songyaru9@gmail.com
 * Date: 2018/7/26  下午6:15
 * @file
 */

const androidWebviewInfo = require('adb-tools').webviewInfo;
const iosWebviewInfo = require('ios-webkit-debug-tools').webviewInfo;

const getAndroidInfo = () => {
    return androidWebviewInfo({prefix: '*'});
};

const getIosInfo = async () => {
    return iosWebviewInfo();
};

const getDeviceInfo = async () => {
    let androidInfo = await getAndroidInfo().catch(_ => []);
    let iosInfo = await getIosInfo().catch(_ => []);
    return {android: androidInfo, ios: iosInfo};
};

module.exports = {getAndroidInfo, getIosInfo, getDeviceInfo};