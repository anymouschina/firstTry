const Joi = require('joi');
const { paginationDefine } = require('../utils/router-helper');
const models = require('../models');
const { env } = process;
const GROUP_NAME = 'votings';

module.exports = [
  {
    method: 'GET',
    path: `/${GROUP_NAME}/findListPage`,
    handler: async (request, reply) => {
        console.log(request.query)
     const list = await models.votings.find().skip((request.query.page - 1) * request.query.limit).limit(request.query.limit)
     if(request.query.open_id){
        const userOrderList = await models.votingOrders.find({open_id:request.query.open_id})
        const orderNameList = userOrderList.map(item=>item.name)
        const newMap = list.map(item=>{ 
            return {
                ...item._doc,
                state:orderNameList.indexOf(item.name)>-1
            }
         })
         reply({status:200,data:newMap})
     }else{
        reply({status:200,data:list})
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
    method: 'POST',
    path: `/${GROUP_NAME}/create`,
    handler: async (request, reply) => {
     const {name,left,right} = request.payload;
     const list = await models.votings.find({name})
     if(list.length>0){
        reply({status:201,message:'已存在该类投票'}) 
     }else{
        const voting = new models.votings({
            name,left,right
         })
         voting.save((err)=>{
             if(err)reply({status:500,error:err})
             else reply({status:200,message:'新建主题成功'})
         })
     }
    },
    config: {
      tags: ['api', GROUP_NAME],
      auth:false,
      description: '发起投票',
      validate: {
        payload: {
            name: Joi.string().required().description('投票主题名'),
            left:Joi.number().description('赞成左方的数量,默认为0'),
            right:Joi.number().description('赞成右方的数量,默认为0')
        },
      },
    },
  },
  {
    method: 'POST',
    path: `/${GROUP_NAME}/choosed`,
    handler: async (request, reply) => {
     const {user,open_id,choosed,name} = request.payload
     const voting = await new models.votingOrders({
        user,//用户名
        open_id,//openid
        choosed,//选择 0 1
        name,//投票主题
        state:true
     })
     voting.save((err)=>{
         if(err)reply({status:500,error:err})
         else {
             models.votings.where({name}).updateOne({$inc:{left:choosed===0?1:0,right:choosed===1?1:0}},(err)=>{
                 if(err)reply({status:500,error:err})
                 else reply({status:200,message:'投票成功'})
             })
         }
     })
    },
    config: {
      tags: ['api', GROUP_NAME],
      auth:false,
      description: '新建投票主题',
      validate: {
        payload: {
            user: Joi.string().required().description('用户名'),//用户名
            open_id:Joi.string().required().description('用户open_id'),//openid
            choosed: Joi.number().required().description('选择'),//选择 0 1
            name:Joi.string().required().description('主题'),//投票主题
        },
      },
    },
  },
];
