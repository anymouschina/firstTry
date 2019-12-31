const Hapi = require('@hapi/hapi');
const H2o2 = require('@hapi/h2o2');
const hapiAuthJWT2 = require('hapi-auth-jwt2');
require('env2')('./.env');
const config = require('./config');
const routesUsers = require('./routes/users');
const routesVotings = require('./routes/votings');
const routesGoods = require('./routes/goods')
const pluginHapiSwagger = require('./plugins/hapi-swagger');
const pluginHapiPagination = require('./plugins/hapi-pagination');
const pluginHapiAuthJWT2 = require('./plugins/hapi-auth-jwt2');
const server = Hapi.server({
  port: 3000,
  host: 'localhost'
});
const init = async () => {
  // 注册插件
  try {
    await server.register([H2o2,
      ...pluginHapiSwagger,
      pluginHapiPagination,
      hapiAuthJWT2]);
      pluginHapiAuthJWT2(server);
       // 注册路由
      server.route([
        // 创建一个简单的hello hapi接口
        ...routesUsers,
        ...routesVotings,
        ...routesGoods,{
          method: 'GET',
          path: '/wxserver/{name}',
          handler: {
              proxy: {
                  uri: 'https://amlie.oicp.vip/{name}'
              }
          }
      },{
        method: 'POST',
        path: '/wxserver/{name}',
        handler: {
            proxy: {
                uri: 'https://amlie.oicp.vip/{name}'
            }
        }
    },
      ]);
    await server.start();

    console.log(`Server started at:  ${server.info.uri}`);
  }
  catch(e) {
    console.log('Failed to load h2o2');
  }
};

init();
