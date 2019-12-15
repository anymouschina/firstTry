const Joi = require('joi');
const { paginationDefine } = require('../utils/router-helper');
const models = require('../models');
const { env } = process;
const GROUP_NAME = 'goods';
const getgoodsInfo = require('../utils/getgoodsInfo')
module.exports = [
  {
    method: 'GET',
    path: `/${GROUP_NAME}/findListPage`,
    handler: async (request, reply) => {
     const {open_id} = request.query
     const total = await models[GROUP_NAME].find({open_id}).count();
     const list = await models[GROUP_NAME].find({open_id})
     .sort({'created':-1}).skip((request.query.page - 1) * request.query.limit).limit(request.query.limit)
     reply({status:200,data:list,total})
    },
    config: {
      tags: ['api', GROUP_NAME],
      auth:false,
      description: '获取列表',
      validate: {
        query: {
          open_id:Joi.string().required().description('用户唯一标识/暂非必填'),
          ...paginationDefine,
        },
      },
    },
  },
  {
    method: 'GET',
    path: `/${GROUP_NAME}/findListPageByBarcode`,
    handler: async (request, reply) => {
        let {barcode,open_id} = request.query
        let list = await models.goods.find({barcode,open_id})
        if(list.length>0){reply({status:200,data:list[0],msg:'库中查到了数据'})}
        else getgoodsInfo(barcode,reply,models,open_id)
    },
    config: {
      tags: ['api', GROUP_NAME],
      auth:false,
      description: '获取商品信息',
      validate: {
        query: {
          open_id:Joi.string().description('用户唯一标识/暂非必填'),
          barcode:Joi.number().description('条形码数据')
        },
      },
    },
  },
  {
    method: 'POST',
    path: `/${GROUP_NAME}/create`,
    handler: async (request, reply) => {
     const {name,left,right,leftName,rightName} = request.payload;
     const list = await models.votings.find({name})
     if(list.length>0){
        reply({status:201,message:'已存在该类投票'}) 
     }else{
        const voting = new models.votings({
            name,left,right,leftName,rightName
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
      description: '新建投票主题',
      validate: {
        payload: {
            name: Joi.string().required().description('投票主题名'),
            left:Joi.number().description('赞成左方的数量,默认为0'),
            right:Joi.number().description('赞成右方的数量,默认为0'),
            leftName:Joi.string().required().description('左侧选项名'),
            rightName:Joi.string().required().description('右侧选项名')
        },
      },
    },
  },
  {
    method: 'POST',
    path: `/${GROUP_NAME}/choosed`,
    handler: async (request, reply) => {
     const {open_id,choosed,name} = request.payload
     const voting = await new models.votingOrders({
        // user,//用户名
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
      description: '选择其中一方',
      validate: {
        payload: {
            // user: Joi.string().required().description('用户名'),//用户名
            open_id:Joi.string().required().description('用户open_id'),//openid
            choosed: Joi.number().required().description('选择'),//选择 0 1
            name:Joi.string().required().description('主题'),//投票主题
        },
      },
    },
  },
];
