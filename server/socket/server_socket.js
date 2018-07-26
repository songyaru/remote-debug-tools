/**
 *
 * Author: songyaru | songyaru9@gmail.com
 * Date: 2018/7/5  下午6:26
 * @file server socket files
 */

const serverSocket = (socket, io) => {
    // 接收来自 inspector 的消息
    socket.on('inspector-server-master-message', (data = {}) => {
        console.log('', '   -inspector-server-master-message- ', data);
        data.from = 'inspector';
        // 转发给 master
        io.emit('server-master-message', data);
    });

    // 接收来自 master 页面的消息
    socket.on('master-server-inspector-message', (data = {}) => {
        console.log('', '   -master-server-inspector-message- ', data);

        // server 转发给 inspector
        data.from = 'master';


        // let type = data.type;
        // let msg = data.msg || {};
        //
        // let state = msg.state;
        // let slaveId = msg.slaveId;
        //
        //
        // switch (type) {
        //     case 'slave-lifecycle':
        //         if (state === 'onAppShow') {
        //             // todo
        //         }
        //         break;
        //
        //
        //     case 'slave-unload':
        //         // master 页面关闭
        //         if (slaveId === 10) {
        //             // todo 处理 master 页面关闭
        //         }
        //
        //         break;
        // }
        // if (data.msg) {
        //     switch (data.msg.status) {
        //         case 'onAppShow':
        //             console.log('', '   -onAppShow- ', data.msg);
        //             break;
        //     }
        // }


        io.emit('server-inspector-message', data);
    });


    // 接收来自 master 的消息,发给 slave
    socket.on('master-server-slave-message', (data = {}) => {
        console.log('', '   -master-server-slave-message- ', data);

        // server 转发给 master 页面
        data.from = 'master';
        io.emit('server-slave-message', data);
    });

    // 接收来自 slave 的消息,发给 master
    socket.on('slave-server-master-message', (data = {}) => {
        console.log('', '   -slave-server-master-message- ', data);

        // master 转发给 slave
        data.from = 'slave';
        io.emit('server-master-message', data);
    });

};


module.exports = serverSocket;


