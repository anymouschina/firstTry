const Joi = require('joi');
const { paginationDefine } = require('../utils/router-helper');
const models = require('../models');
const { env } = process;
const GROUP_NAME = 'luckDraws';

module.exports = [
  {
    method: 'GET',
    path: `/${GROUP_NAME}/findListPage`,
    handler: async (request, reply) => {
     const {type} = request.query
     const total = await models[GROUP_NAME].find(type?{type}:null).count();
     const list = await (type?models[GROUP_NAME].find({type}):models[GROUP_NAME].find()).sort({'created':1}).skip((request.query.page - 1) * request.query.limit).limit(request.query.limit)
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
    path: `/${GROUP_NAME}/create`,
    handler: async (request, reply) => {
    const luckDraw = new models[GROUP_NAME](request.payload)
      luckDraw.save((err,res)=>{
          if(err)reply({status:500,error:err})
          else {
            const obj = {...res._doc,userNum:0}
            console.log(obj,'???')
            const luckInfo = new models.luckInfo({
              "luckDraw":obj,
              "luckDrawPeople": [
              ],
              "luckers": [
               
              ],
              "userLuckDraw": "你可以参与抽奖",
              "_id": res._id
            })
            luckInfo.save()
            reply({status:200,message:'新建成功'})
          }
      })
    },
    config: {
      tags: ['api', GROUP_NAME],
      auth:false,
      description: '新建热评',
      validate: {
        payload: {
            title: Joi.string().required().description('标题'),
            conditionType:Joi.string().required().description('类型'),//1皮肤,2碎片
            isFinish:Joi.boolean().required().description('是否结束').default(false),//是否结束
            openNum:Joi.number().description('开奖人数'),//开奖需要人数
            openTime:Joi.date().description('开奖时间'),//开奖时间
            pic:Joi.string().required().description('图片'),//图片
            peopleGroup:Joi.array().description('参与人列表'),//参与人列表
        },
      },
    },
  }
];
