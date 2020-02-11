const Joi = require('joi');
const { paginationDefine } = require('../utils/router-helper');
const models = require('../models');
const { env } = process;
const GROUP_NAME = 'luckInfo';

module.exports = [
  {
    method: 'GET',
    path: `/${GROUP_NAME}/findListPage`,
    handler: async (request, reply) => {
     const {type} = request.query
     const total = await models[GROUP_NAME].find(type?{type}:null).count();
     const list = await (type?models[GROUP_NAME].find({type}):models[GROUP_NAME].find()).sort({'created':-1}).skip((request.query.page - 1) * request.query.limit).limit(request.query.limit)
     if(list.length>0){
       reply({
         status:200,
         data:list,
         total
       })
     }else{
      reply({
        status:200,
        data:[],
        total
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
    method: 'POST',
    path: `/${GROUP_NAME}/luckJoin`,
    handler: async (request, reply) => {
    const {luckDrawId,user} = request.payload;
      const {nick_name,avatar_url,open_id} = user
      const joinRecord= new models.usersJoinRecord({
        nick_name,
        avatar_url,
        open_id,
        luckDrawId
      })
      joinRecord.save(reply({
        status:200,
        data:'更新成功'
      }))
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
    await models[GROUP_NAME].findById(id,async (err,doc)=>{
      const arr = await models.usersJoinRecord.find({luckDrawId:id})
      const len = arr.countDocuments()
      const userRecord = arr.skip(0).limit(10)
      console.log(len,userRecord)
      doc.luckDraw.userNum = len;
      doc.luckDrawPeople = userRecord;
      doc.save(reply({
        status:200,
        data:doc
      }))
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
            luckDraw:Joi.object().required().description('抽奖详情'),//抽奖详情
            luckDrawPeople:Joi.array().required().description('参与人数'),//参与人
            luckers:Joi.array().required().description('中奖人'),//中奖人
            userLuckDraw:Joi.string().required().description('文字'),//文字提示
            _id:Joi.string().required().description('唯一标识')
        },
      },
    },
  }
];
