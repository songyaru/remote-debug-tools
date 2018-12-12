/**
 *
 * Author: songyaru | songyaru9@gmail.com
 * Date: 2018/7/31  下午2:48
 * @file
 */
/* eslint-disable */
(function () {

    var allSockets = {};

    var isMaster = function (cName) {
        return /master/.test(cName);
    };
    var isSlave = function (cName) {
        return /slave/.test(cName);
    };

    var debounce = function (func, wait, immediate) {
        var timeout, args, context, timestamp, result;

        var later = function () {
            var last = Date.now() - timestamp;
            if (last < wait && last >= 0) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                }
            }
        };

        return function () {
            context = this;
            args = arguments;
            timestamp = Date.now();
            var callNow = immediate && !timeout;
            if (!timeout) timeout = setTimeout(later, wait);
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }

            return result;
        };
    };

    var getTargetByUrl = function (url) {
        var links = document.getElementsByTagName('a') || [];
        for (var i = 0; i < links.length; i++) {
            var target = links[i];
            if (target.getAttribute('data-socket') === url) {
                return target;
            }
        }
        return null;
    };
    var setLinkAvailable = function (url) {
        var target = getTargetByUrl(url);
        if (target) {
            target.className = target.className.replace('disable', '');
        }
    };

    var getSocket = function (url) {

        return new Promise(function (resolve, reject) {
            if (!url) {
                reject('无法连接页面');
            }
            var socket = allSockets[url];
            if (!socket) {
                socket = new WebSocket(url);
                socket.available = false;
                allSockets[url] = socket;
                socket.onmessage = function (data) {
                    console.log(url + 'onmessage' + data);

                    data = data || '{"data":{}}';
                    var response = JSON.parse(data.data);
                    if (response.id == 0) {
                        var result = response.result;
                        if (result && result.result) {
                            socket.available = result.result.value;
                            if (socket.available) {
                                setLinkAvailable(url);
                            }
                            socket.close();
                        }
                    }
                };
                socket.onerror = function (data) {
                    allSockets[url] = null;
                    reject(data);
                };
                socket.onclose = function (data) {
                    allSockets[url] = null;
                    reject(data);
                };
                socket.onopen = function (data) {
                    socket.canHighlight = true;
                    resolve(socket);
                }
            } else {
                resolve(socket);
            }

        });

    };


    var highlight = function (socket) {
        if (socket.canHighlight) {
            socket.send(JSON.stringify({
                "id": 0,
                "method": "DOM.highlightRect",
                "params": {
                    "x": 0,
                    "y": 0,
                    "width": 9999,
                    "height": 9999,
                    "color": {"r": 111, "g": 168, "b": 220, "a": 0.66}
                }
            }));
        }
    };

    var hideHighlight = function (socket) {
        socket.canHighlight = false;
        socket.send(JSON.stringify({"id": 0, "method": "DOM.hideHighlight"}));
        debounce(function () {
            socket.canHighlight = true;
        }, 100)();
    };

    var insertScript = function (ip, port, isMaster) {
        var head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
        var script = document.createElement("script");
        script.src = 'http://' + ip + ':' + port + '/preload/' + (isMaster ? 'master.js' : 'slave.js');
        if (head) {
            if (!head.getAttribute('data-inspector')) {
                head.appendChild(script);
                script.onload = script.onreadystatechange = function () {
                    script.onreadystatechange = script.onload = null;
                    head.setAttribute('data-inspector', 'true');
                    document.title += (isMaster ? '-master' : '-slave');
                };
            }
            return true;
        }
        return false;
    };


    var evaluateScript = function (socket, injectedFunction, params) {
        params = params || '';
        try {
            socket.send(JSON.stringify({
                "id": 0,
                "method": "Runtime.evaluate",
                "params": {"expression": "(" + injectedFunction.toString() + ").apply(null,[" + params.toString() + "])"}
            }));
            return Promise.resolve(socket);
        } catch (e) {
            Promise.reject(e)
        }
    };


    var app = document.getElementById('app');

    var injectPreload = function (socketUrl, isMaster) {
        var params = ['"' + ip + '"', location.port, !!isMaster];
        getSocket(socketUrl).then(function (socket) {
            evaluateScript(socket, insertScript, params);
        }).catch(function (e) {
            console.log(e);
        });
    };

    var allIosSmartWebview = document.querySelectorAll('.ios .smart');

    for (var i = 0; i < allIosSmartWebview.length; i++) {
        var target = allIosSmartWebview[i];
        var socketUrl = target.dataset['socket'];
        var cName = target.className;
        injectPreload(socketUrl, isMaster(cName));
    }





    app.addEventListener('mouseover', function (e) {

        var cName = e.target.className;
        if (e.target.nodeName.toLowerCase() === 'a') {
            var socketUrl = e.target.dataset['socket'];

            if (!isMaster(cName)) {
                getSocket(socketUrl)
                    .then(function (socket) {
                        debounce(function () {
                            highlight(socket);
                        }, 100)();
                    })
                    .catch(function (e) {
                        console.log(e);
                    });
            }
        }
    }, false);

    app.addEventListener('mouseout', function (e) {
        if (e.target.nodeName.toLowerCase() === 'a' && e.target.className !== 'smart') {
            var socketUrl = e.target.dataset['socket'];
            getSocket(socketUrl)
                .then(hideHighlight)
                .catch(function (e) {
                    console.log(e);
                });
        }
    }, false);


    app.addEventListener('click', function (e) {
        if (e.target.nodeName.toLowerCase() === 'a') {
            var href = e.target.href;

            if (isMaster(e.target.className)) {
                var port = e.target.parentNode.parentNode.dataset['port'];
                var isIos = e.target.parentNode.parentNode.dataset['ios'];
                href += '&fport=' + port + (isIos === 'true' ? '&ios=true' : '');
            }
            var socketUrl = e.target.dataset['socket'];

            getSocket(socketUrl)
                .then(function (socket) {
                    socket.close();
                });

            window.open(href);
            e.stopPropagation();
            e.preventDefault();
        }
    }, false);
})();

/* eslint-enable */