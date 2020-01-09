const inert = require('inert');
const vision = require('vision');
const packageModule = require('package');
const hapiSwagger = require('hapi-swagger');

module.exports = [
  inert,
  vision,
  {
    register: hapiSwagger,
    options: {
      'schemes': ['https'],
      'host': 'www.saberc8.cn',
      info: {
        title: '接口文档',
        version: packageModule.version,
      },
      // 定义接口以tags属性定义为分组
      grouping: 'tags',
      tags: [
        // { name: 'tests', description: '测试相关' },
        // { name: 'shops', description: '店铺、商品相关' },
        // { name: 'orders', description: '操作命令相关' },
        { name: 'users', description:'用户'},
        { name: 'votings', description:'投票相关'},
        { name: 'goods', description:'商品相关'},
        {name:'hotComments',description:'热评相关'}
      ],
    },
  },
];
