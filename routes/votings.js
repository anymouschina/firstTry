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
     const total = await models.votings.find().count();
     const list = await models.votings.find().sort({'created':-1}).skip((request.query.page - 1) * request.query.limit).limit(request.query.limit)
     if(request.query.open_id&&request.query.open_id!==""&&(await models.votingOrders.find({open_id:request.query.open_id})).length>0){
        const userOrderList = await models.votingOrders.find({open_id:request.query.open_id})
        const orderNameList = userOrderList.map(item=>item.name)
        const newMap = list.map(item=>{ 
          let choosedIndex = orderNameList.indexOf(item.name)
          let leftPercenter = ((left,right)=>{
            if(left===0&&right!==0)return 0;
            else if(left===0&&right===0) return 50;
            else if(left!==0&&right===0)return 100;
            else return Number(left*100/(left+right)).toFixed(1);
          })(item._doc.left,item._doc.right)
            return {
                ...item._doc,
                choosed:choosedIndex >-1?userOrderList[choosedIndex].choosed:null,
                leftPercent:leftPercenter,
                rightPercent:Number(100-leftPercenter).toFixed(1)
            }
         })
         reply({
          status:200,
          total:total,
          data:newMap})
     }else{
        const newMap = list.map(item=>{ 
          let leftPercenter = ((left,right)=>{
            if(left===0&&right!==0)return 0;
            else if(left===0&&right===0) return 50;
            else if(left!==0&&right===0)return 100;
            else return Number(left*100/(left+right)).toFixed(1);
          })(item._doc.left,item._doc.right)
            return {
                ...item._doc,
                choosed:null,
                leftPercent:leftPercenter,
                rightPercent:Number(100-leftPercenter).toFixed(1)
            }
         })
        reply({status:200,total:total,data:newMap})
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
