const Joi = require('joi');
const { paginationDefine } = require('../utils/router-helper');
const models = require('../models');
const { env } = process;
const GROUP_NAME = 'usersJoinRecord';

module.exports = [
  {
    method: 'GET',
    path: `/${GROUP_NAME}/findListPage`,
    handler: async (request, reply) => {
     const {luckDrawId} = request.query
     const total = await models[GROUP_NAME].find({luckDrawId}).countDocuments();
     const list = models[GROUP_NAME].find({luckDrawId}).sort({'created':1}).skip((request.query.page - 1) * request.query.limit).limit(request.query.limit)
    
    const pages = total/request.query.limit+total%request.query.limit===0?0:1
    console.log(list,total,'!!!',pages)
       reply({
         status:200,
         data:list,
         total,
         pages
       })
    },
    config: {
      tags: ['api', GROUP_NAME],
      auth:false,
      description: '获取列表',
      validate: {
        query: {
          open_id:Joi.string().description('用户唯一标识/暂非必填'),
          type:Joi.string().description('类型'),
          luckDrawId:Joi.string().required().description('唯一标识'),
          ...paginationDefine,
        },
      },
    },
  },
  {
    method: 'GET',
    path: `/${GROUP_NAME}/deleteMany`,
    handler: async (request, reply) => {
    const list = await models[GROUP_NAME].deleteMany()
      reply({
        status:200,
        data:list
      })
    },
    config: {
      tags: ['api', GROUP_NAME],
      auth:false,
      description: '查询内容',
    },
  },
  {
    method: 'GET',
    path: `/${GROUP_NAME}/isJoined`,
    handler: async (request, reply) => {
        const {luckDrawId,open_id} = request.query
    const list = await models[GROUP_NAME].find({luckDrawId,open_id})
      reply({
        status:200,
        data:list
      })
    },
    config: {
      tags: ['api', GROUP_NAME],
      auth:false,
      description: '查询内容',
      validate:{
          query:{
          luckDrawId:Joi.string().required().description('唯一标识'),
          open_id:Joi.string().required().description('用户信息')}
      }
    },
  },
  {
    method: 'POST',
    path: `/${GROUP_NAME}/luckJoin`,
    handler: async (request, reply) => {
    const {luckDrawId,user} = request.payload;
    await models[GROUP_NAME].findById(luckDrawId,async function (err, doc) {
      if (err) {
        reply(err)
      }
      doc.luckDrawPeople.push(user);
      let obj = {};
      Object.keys(doc.luckDraw).map(item=>{
        obj[item] = doc.luckDraw[item]
      })
      obj.userNum++;
      await models.luckDraws.findById(luckDrawId,async function(err,doc1){
        doc1.peopleGroup.push(user);
        doc1.save();
      })
      // if(doc.luckDraw.userNum>=doc.luckDraw.openNum){
      //   doc.luckDraw.isFinish = true;
      // }
      doc.luckDraw = obj
      doc.save(reply({
        status:200,
        data:'更新成功'
      }));
    });
     
    },
    config: {
      tags: ['api', GROUP_NAME],
      auth:false,
      description: '查询内容',
      validate: {
        payload:{
          luckDrawId:Joi.string().required().description('唯一标识'),
          user:Joi.object().required().description('用户信息')
        }
      },
    },
  },
  {
    method: 'GET',
    path: `/${GROUP_NAME}/findById`,
    handler: async (request, reply) => {
    const {id} = request.query;
    const list = await models[GROUP_NAME].findById(id)
      reply({
        status:200,
        data:list
      })
    },
    config: {
      tags: ['api', GROUP_NAME],
      auth:false,
      description: '查询内容',
      validate: {
        query:{
          id:Joi.string().required().description('唯一标识'),
        }
      },
    },
  },
  {
    method: 'GET',
    path: `/${GROUP_NAME}/random`,
    handler: async (request, reply) => {
      const {type} = request.query
        models[GROUP_NAME].random(function(err,list){
          reply({
            status:200,
            data:list,
            err:err
          })
        },type?{type}:false)
    },
    config: {
      tags: ['api', GROUP_NAME],
      auth:false,
      description: '查询内容',
      validate:{
        query: {
          type:Joi.string().description('类型')
        },
      }
    },
  },
  {
    method: 'POST',
    path: `/${GROUP_NAME}/create`,
    handler: async (request, reply) => {
    const luckDraw = new models[GROUP_NAME](request.payload)
      luckDraw.save((err)=>{
          if(err)reply({status:500,error:err})
          else reply({status:200,message:'新建成功'})
      })
    },
    config: {
      tags: ['api', GROUP_NAME],
      auth:false,
      description: '新建抽奖信息',
      validate: {
        payload: {
            nick_name:Joi.string().required().description('抽奖人名字'),//抽奖人名字
            avatar_url: Joi.string().required().description('抽奖人头像'),//抽奖人头像
            open_id: Joi.string().required().description('openId'),//抽奖人open_id
            luckDrawId:Joi.string().required().description('参与抽奖id'),//参与抽奖
            title:Joi.string().required().description('抽奖主题'),//抽奖主题
        },
      },
    },
  }
];
