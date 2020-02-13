const Hapi = require('hapi');
const hapiAuthJWT2 = require('hapi-auth-jwt2');
require('env2')('./.env');
const config = require('./config');
const {outRoutes} = require('./routes/index')
const pluginHapiSwagger = require('./plugins/hapi-swagger');
const pluginHapiPagination = require('./plugins/hapi-pagination');
const pluginHapiAuthJWT2 = require('./plugins/hapi-auth-jwt2');
const server = new Hapi.Server();
// 配置服务器启动host与端口
server.connection({
  port: 3000,
  host: '127.0.0.1',
  routes: {
    cors: {
        origin: ['*']
    }
}
});
schedule.scheduleJob('0 3 * * ? ',()=>{
  request({
    url:'https://www.saberc8.cn/users/resetRegister',
    method:'GET'
  },()=>{console.log('每天0点置空签到时间')})
})
const init = async () => {
  // 注册插件
  await server.register([
    ...pluginHapiSwagger,
    pluginHapiPagination,
    hapiAuthJWT2,
  ]);
  pluginHapiAuthJWT2(server);
  // 注册路由
  server.route(outRoutes);
  // 启动服务
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

init();
