/* eslint-disable */

var socket = io('http://localhost:8090', {
    'transports': ['websocket', 'polling']
});
// console.log('', '   -socket- ', socket);

// master 页面向 server 发送消息
var sendMessage = function (type, msg) {
    socket.emit('master-server-inspector-message', {type: type, msg: msg});
};


window.getAppData = function (slaveId) {
    return new Promise((resolve, reject) => {
        if (slaveId == undefined) {
            var _slave;
            if (typeof masterManager !== 'undefined') {
                _slave = masterManager.navigator.history.getTopSlaves()[0];
            } else if (typeof privateSwan !== 'undefined') {
                _slave = privateSwan.navigator.history.getTopSlaves()[0];
            } else {
                reject('cannot get slave id');
                return;
            }
            if (_slave.currentIndex !== undefined) {
                _slave = _slave.children[_slave.currentIndex];
            }
            slaveId = _slave.getSlaveId();
        }
        socket.emit('master-server-slave-message', {type: 'get-app-data', slaveId: slaveId});
        socket.once('server-master-message', data => {
            data.msg = data.msg || {};
            if (data.from === 'slave' && data.msg.slaveId === slaveId) {
                resolve(data.msg.data);
            }
        });
    });
};

socket.on('server-master-message', function (data) {
    if (data.from === 'inspector') {
        switch (data.type) {
            case 'eval':
                var ret = eval(data.eval);
                var id = data.id;
                if (id) {
                    sendMessage('eval-return', {id, val: ret});
                }
                break;
        }
    }
    /*else if (data.from === 'slave') {
           switch (data.type) {
               case 'get-app-data':
                   console.log('', '   -get-app-data- ', data);
                   break;
           }
       }*/
});
document.addEventListener('message', ev => {
    var msg = ev.message;
    if (!msg) {
        return;
    }
    var slaveId = msg.slaveId | 0;
    var value = msg.value || {};
    var valType = value.type;
    var params = msg.params;

    switch (msg.type) {
        case 'slaveLoaded':
            sendMessage('slave-loaded', {slaveId: slaveId});
            break;
        case 'abilityMessage':
            if (valType == 'navigate' && params) {
                sendMessage('new-url', {url: params.url});
            }
            break;

    }
});


document.addEventListener('lifecycle', ev => {
    var slaveId = ev['wvID'] | 0;
    var status = ev['lcType'];
    switch (status) {
        case 'onShow':
            sendMessage('slave-visible', {slaveId: slaveId, visible: 'show'});
            break;
        case 'onHide':
            sendMessage('slave-visible', {slaveId: slaveId, visible: 'hide'});
            break;
        case 'onUnload':
            sendMessage('slave-unload', {slaveId: slaveId});
            break;
        default:
            sendMessage('slave-lifecycle', {slaveId: slaveId, status: status, href: location.href});
    }
});


/*eslint-enable*/
