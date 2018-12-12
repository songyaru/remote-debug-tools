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
                    data: window.appData
                }
            });
        }
    }
});

/*eslint-enable*/



