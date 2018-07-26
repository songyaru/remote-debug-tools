/**
 *
 * Author: songyaru | songyaru9@gmail.com
 * Date: 2018/7/5  下午6:26
 * @file server index
 */
const http = require('http');

const Koa = require('koa');
const staticServer = require('koa-static');
const bodyParser = require('koa-bodyparser');
const cacheControl = require('koa-cache-control');
const gzip = require('koa-compress');

const constant = require('../constant');
const controller = require('./controller');
const serverSocket = require('./socket/server_socket');

const devtoolsRootPath = process.env['SERVER_DIR'] || constant['SERVER_DIR'];

const serverPort = parseInt(process.env['PORT'], 10) || constant['PORT'];


let app = new Koa();
app.use(gzip());

app.use(async (ctx, next) => {
    // console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    await next();
});


app.use(bodyParser());
app.use(controller());



// // 静态资源设置缓存
// app.use(cacheControl({
//     maxAge: 24 * 3600
// }));
app.use(staticServer(devtoolsRootPath));


let server = http.createServer(app.callback());
let io = require('socket.io')(server);
io.on('connection', socket => serverSocket(socket, io));


server.listen(serverPort);
console.log(`Started hosted mode server at http://localhost:${serverPort}\n`);



