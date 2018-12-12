/* eslint-disable */

// todo 自动生成
window.Set = window.Set || function () {
    var items = {};

    this.has = function (value) {
        return items.hasOwnProperty(value);
    };
    this.add = function (value) {
        if (!this.has(value)) {
            items[value] = value;
            return true;
        }
        return false;
    };
    this.delete = this.remove = function (value) {
        if (this.has(value)) {
            delete items[value];
            return true;
        }
        return false;
    };
    this.clear = function () {
        items = {};
    };
    this.size = function () {
        var count = 0;
        for (var prop in items) {
            if (items.hasOwnProperty(prop)) {
                ++count;
            }
        }
        return count;
    };
    this.values = function () {
        var values = [];
        for (var value in items) {
            if (items.hasOwnProperty(value)) {
                values.push(value);
            }
        }
        return values;
    };
    this.union = function (otherSet) {
        var unionSet = new Set();
        var values = this.values();
        for (var i = 0; i < values.length; i++) {
            unionSet.add(values[i]);
        }

        values = otherSet.values();
        for (var i = 0; i < values.length; i++) {
            unionSet.add(values[i]);
        }

        return unionSet;
    };
    this.intersection = function (otherSet) {
        var intersection = new Set();
        var values = this.values();
        for (var i = 0; i < values.length; i++) {
            if (otherSet.has(values[i])) {
                intersection.add(values[i]);
            }
        }
        return intersection;
    };
    this.difference = function (otherSet) {
        var difference = new Set();
        var values = this.values();
        for (var i = 0; i < values.length; i++) {
            if (!otherSet.has(values[i])) {
                difference.add(values[i]);
            }
        }
        return difference;
    };
    this.subset = function (otherSet) {
        var values = this.values();
        if (this.size() > otherSet.size()) {
            return false;
        }
        else {
            for (var i = 0; i < values.length; i++) {
                if (!otherSet.has(values[i])) {
                    return false;
                }
            }
            return true;
        }
    }
};

var socket = io('http://localhost:8090', {
    'transports': ['websocket', 'polling']
});

// master 页面向 server 发送消息
var sendMessage = function (type, msg) {
    socket.emit('master-server-inspector-message', {type: type, msg: msg});
};

var getAppData = function (slaveId) {
    return new Promise(function (resolve, reject) {
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
        socket.once('server-master-message', function (data) {
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
                    sendMessage('eval-return', {id: id, val: ret});
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
document.addEventListener('message', function (ev) {
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


document.addEventListener('lifecycle', function (ev) {
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
