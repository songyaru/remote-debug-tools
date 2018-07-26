/* eslint-disable */

document.addEventListener('message', function (e) {
    if (!e.message) {
        return;
    }
    var msg = JSON.parse(unescape(decodeURIComponent(e.message)));
    switch (msg.type) {
        case 'initData':
            window.appData = msg.value;
            break;
        case 'setData':
            window.appData = msg.setObject;
            break;
    }
});


var socket = io('http://localhost:8090', {
    'transports': ['websocket', 'polling']
});


socket.on('server-slave-message', function (data) {
    if (data.from === 'master' && data.type === 'get-app-data') {
        var slaveId = data.slaveId;
        // todo slave 获取自己的 slaveId
        if (window.appData) {
            socket.emit('slave-server-master-message', {
                type: 'get-app-data',
                msg: {
                    slaveId: slaveId,
                    'data': window.appData
                }
            });
        }
    }
});

/*eslint-enable*/



