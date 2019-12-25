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
     const {open_id,pagination} = request.query
     const total = await models[GROUP_NAME].find({open_id}).count();
     let list ;
     if(pagination){
      list= await models[GROUP_NAME].find({open_id})
     .sort({'created':-1}).skip((request.query.page - 1) * request.query.limit).limit(request.query.limit)
     }else{
      list= await models[GROUP_NAME].find({open_id})
      .sort({'created':-1})
     }
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
    method: 'POST',
    path: `/${GROUP_NAME}/findListPageByTags`,
    handler: async (request, reply) => {
     const {tags,count,title} = request.payload;
     let defaultTags = ['语文','文学','数学','物理','计算机','小说','玄幻','前端','化学','历史','高科技','奇异','灵异','军事','商业','提升','管理']
      if(tags){
        defaultTags = [...defaultTags,...tags];
      }
      if(title==='')getgoodsInfo.dealBooks(defaultTags[Number.parseInt(Math.random()*100000%(defaultTags.length))],count,reply)
      else{
        getgoodsInfo.searchBooks(title,count,reply)
      }
    },
    config: {
      tags: ['api', GROUP_NAME],
      auth:false,
      description: '随机获取列表',
      validate: {
       payload:{
        tags:Joi.array().description('随机范围标签'),
        count:Joi.number().description('随机得到的数量'),
        open_id:Joi.string().description('用户唯一标识/暂非必填'),
        title:Joi.string().description('精确搜索')
       }
      },
    },
  },
  {
    method: 'GET',
    path: `/${GROUP_NAME}/deleteByBarcode`,
    handler: async (request, reply) => {
        let {barcode,open_id} = request.query
        models.goods.deleteMany({isbn13:barcode,open_id}).then((res)=>{
            reply({statu:200,data:res})
        })
    },
    config: {
      tags: ['api', GROUP_NAME],
      auth:false,
      description: '移出书架',
      validate: {
        query: {
          open_id:Joi.string().required().description('用户唯一标识/暂非必填'),
          barcode:Joi.number().required().description('条形码数据')
        },
      },
    },
  },
  {
    method: 'POST',
    path: `/${GROUP_NAME}/deleteByBatch`,
    handler: async (request, reply) => {
        let {ids,open_id} = request.payload
        models.goods.deleteMany({ isbn13: { $in: ids } , open_id}).then((res)=>{
            reply({statu:200,data:res})
        })
    },
    config: {
      tags: ['api', GROUP_NAME],
      auth:false,
      description: '批量移出书架',
      validate: {
       payload:{
         ids:Joi.array().required().description('需要删除的书籍的code码集合'),
         open_id:Joi.string().required().description('用户标识')
       }
      },
    },
  },
  {
    method: 'GET',
    path: `/${GROUP_NAME}/findListPageByBarcode`,
    handler: async (request, reply) => {
        let {barcode,open_id,join} = request.query
        let list = await models.goods.find({barcode,open_id})
        if(list.length>0){reply({status:200,data:list[0],msg:'库中查到了数据'})}
        else getgoodsInfo.dealBarcode(barcode,reply,models,open_id,join)
    },
    config: {
      tags: ['api', GROUP_NAME],
      auth:false,
      description: '获取商品信息',
      validate: {
        query: {
          open_id:Joi.string().description('用户唯一标识/暂非必填'),
          barcode:Joi.number().description('条形码数据'),
          join:Joi.boolean().description('是否加入书架')
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
