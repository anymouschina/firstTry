const Joi = require('joi');
const { paginationDefine } = require('../utils/router-helper');
const models = require('../models');
const { env } = process;
const GROUP_NAME = 'hotComments';

module.exports = [
  {
    method: 'GET',
    path: `/${GROUP_NAME}/findListPage`,
    handler: async (request, reply) => {
     const total = await models.hotComments.find().count();
     const list = await models.hotComments.find().sort({'created':-1}).skip((request.query.page - 1) * request.query.limit).limit(request.query.limit)
     if(list.length>0){
       reply({
         status:200,
         data:list,
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
    const list = await models.hotComments.findById(id)
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
        models.hotComments.random(function(err,list){
          reply({
            status:200,
            data:list,
            err:err
          })
        })
    },
    config: {
      tags: ['api', GROUP_NAME],
      auth:false,
      description: '查询内容'
    },
  },
  {
    method: 'POST',
    path: `/${GROUP_NAME}/create`,
    handler: async (request, reply) => {
    const {title,content,comment,type,image,from} = request.payload;
    const hotComment = new models.hotComments({
      title,content,comment,type,image,from
      })
      hotComment.save((err)=>{
          if(err)reply({status:500,error:err})
          else reply({status:200,message:'新建成功'})
      })
    },
    config: {
      tags: ['api', GROUP_NAME],
      auth:false,
      description: '新建热评',
      validate: {
        payload: {
            title: Joi.string().required().description('标题'),
            content: Joi.string().required().description('内容'),
            comment: Joi.string().required().description('时间/评论数目'),
            type:Joi.string().required().description('内容类型'),
            from:Joi.string().required().description('内容来源'),
            image:Joi.string().required().description('图片'),
        },
      },
    },
  }
];
