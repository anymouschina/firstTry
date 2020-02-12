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
     let params = request.query;
     const limit = request.query.limit
     const deleteKeys = ['page','limit','pagination']
     Object.keys(params).map(item=>{
       if(deleteKeys.indexOf(item)>-1)delete params[item]
     })
     let total,list,pages = 0,addNum = 0
    if(Object.keys(params).indexOf('isFinish')>-1){
      delete params.isFinish
      total = await models[GROUP_NAME].find(params).populate({
        path: 'luckDrawId'
      , select: 'isFinish title -_id',
      model: models.luckDraws
      , options: { sort: { created: 1 }}
    }).countDocuments();
      list = await models[GROUP_NAME].find(params).populate({
        path: 'luckDrawId'
      , select: 'isFinish title _id',
      model: models.luckDraws
      , options: { sort: { created: 1 }}
    }).sort({'created':1}).skip((request.query.page - 1) * request.query.limit).limit(request.query.limit)  
      addNum = (total%request.query.limit===0)?0:1
        reply({
        status:200,
        data:list,
        total,
        pages:parseInt(total/limit)+parseInt(addNum)
      })
    }else{
      total = await models[GROUP_NAME].find(params).countDocuments();
      list = await models[GROUP_NAME].find(params).sort({'created':1}).skip((request.query.page - 1) * request.query.limit).limit(request.query.limit)  
      pages = total/request.query.limit
      addNum = (total%request.query.limit===0)?0:1
      reply({
        status:200,
        data:list,
        total,
        pages:parseInt(pages)+parseInt(addNum)
      })
    }
       
    },
    config: {
      tags: ['api', GROUP_NAME],
      auth:false,
      description: '获取列表',
      validate: {
        query: {
          open_id:Joi.string().description('用户唯一标识/暂非必填'),
          type:Joi.string().description('类型'),
          luckDrawId:Joi.string().description('唯一标识'),
          isFinish:Joi.boolean().description('是否完成'),
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
    const list = await models[GROUP_NAME].find({_id:luckDrawId,open_id})
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
