const Hapi = require('hapi');
const hapiAuthJWT2 = require('hapi-auth-jwt2');
require('env2')('./.env');
const config = require('./config');
const {outRoutes} = require('./routes/index')
const pluginHapiSwagger = require('./plugins/hapi-swagger');
const pluginHapiPagination = require('./plugins/hapi-pagination');
const pluginHapiAuthJWT2 = require('./plugins/hapi-auth-jwt2');
const server = new Hapi.Server();
const models = require('./models')
const schedule = require('node-schedule')
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
schedule.scheduleJob('30 7 * * *',async ()=>{
  request({
    url:'https://www.saberc8.cn/users/resetRegister',
    method:'GET'
  },()=>{console.log('每天7.30点置空签到时间')})
  const time = new Date()
  const findTime = new Array(time.getFullYear(),(parseInt(time.getMonth()+1)<10?'0':'').concat(parseInt(time.getMonth()+1)),new String(time.getDate()).concat('T00:00:00.000Z')).join('-')
  await models.luckDraws.findOne({openTime:findTime},function(err,doc){
    request({
      url:'https://www.saberc8.cn/luckDraws/finish?id='+doc._id,
      method:'GET'
    },()=>{console.log('结束抽奖')})
  })
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
