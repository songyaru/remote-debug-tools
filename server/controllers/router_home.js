/**
 *
 * Author: songyaru | songyaru9@gmail.com
 * Date: 2018/7/5  上午11:35
 * @file server router homepage
 */

const routerHome = async ctx => {
    ctx.response.body = 'inspector server started';
};
module.exports = {
    'GET /': routerHome
};