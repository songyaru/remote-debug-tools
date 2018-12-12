/**
 *
 * Author: songyaru | songyaru9@gmail.com
 * Date: 2018/8/2  上午1:15
 * @file server router preload
 */

const path = require('path');
const fs = require('fs');

const getIpAddress = require('../utils/ip_address');
const ip = getIpAddress();

let socketIO = fs.readFileSync(path.join(__dirname, '../../preload/socket.io.js'), 'utf8');

let masterSocket = fs.readFileSync(path.join(__dirname, '../../preload/master_socket.js'), 'utf8');
masterSocket = masterSocket.replace('localhost:8090', ip + ':' + global._port);


let slaveSocket = fs.readFileSync(path.join(__dirname, '../../preload/slave_socket.js'), 'utf8');
slaveSocket = slaveSocket.replace('localhost:8090', ip + ':' + global._port);


const preloadMaster = async ctx => {
    ctx.response.type = 'application/javascript';
    ctx.response.body = socketIO + masterSocket;
};
const preloadSlave = async ctx => {
    ctx.response.type = 'application/javascript';
    ctx.response.body = socketIO + slaveSocket;
};

module.exports = {
    'GET /preload/slave.js': preloadSlave,
    'GET /preload/master.js': preloadMaster
};