const Joi = require('joi');
const { paginationDefine } = require('../utils/router-helper');
const models = require('../models');
const { env } = process;
const GROUP_NAME = 'luckDraws';
// const request = require('request')
// const schedule = require('node-schedule')
module.exports = [
  {
    method: 'GET',
    path: `/${GROUP_NAME}/finish`,
    handler: async (request, reply) => {
      try {
        const {id} = request.query;
    const list = await models[GROUP_NAME].findById(id)
    await models[GROUP_NAME].findById(id).updateOne({isFinish:true})
    const total = await models.usersJoinRecord.find({luckDrawId:id}).countDocuments()
    let num = 0;
    if(total<list._doc.prize.num){
      num = total
    }else{
      num = total - list._doc.prize.num
    }
    const random = Math.floor(Math.random()*num%num)
    console.log(random,'1')
    const luckers = await models.usersJoinRecord.find({luckDrawId:id}).sort({created:-1}).skip(random).limit(list._doc.prize.num)
    console.log(luckers,'2')
    let arr = []
    luckers.map(item=>{
      arr.push(item._doc.open_id)
      return item
    })
    await models.luckInfo.findById(id).updateOne({isFinish:true,luckers})
    console.log(arr,'111')
    const luckerResult = await models.usersJoinRecord.find({open_id:{$in:arr},luckDrawId:id}).updateMany({isFinish:true})
    console.log(arr,luckerResult,luckers,'???')
    const luckerRecord = await models.userChangeRecord.insertMany(arr.map(item=>{
      return {
        type:'2',
        content:{...list._doc,num:list._doc.prize.price},
        open_id:item
      }
    }))
    // console.log(list._doc.prize.price,'数据',arr,'??')
    // reply({arr,price:list._doc.prize.price})
    await models.users.find({open_id:{$in:arr},from:'1'}).updateMany({$inc:{skinChipNum:list._doc.prize.price/2}},(err,res)=>{
      if(err)throw err
      else reply({list,res,luckerResult,luckerRecord})
      
    })
      // reply({
      //   status:200,
      //   data:luckers,
      //   random,
      //   num:list._doc.prize.num
      // })
      } catch (e) {
        console.log(e)
      }
    
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
    path: `/${GROUP_NAME}/findListPageCount`,
    handler: async (request, reply) => {
     const total = await models[GROUP_NAME].find({isFinish:false}).countDocuments();
     reply({status:200,total})
    },
    config: {
      tags: ['api', GROUP_NAME],
      auth:false,
      description: '获取列表',
     
    },
  },
  {
    method: 'GET',
    path: `/${GROUP_NAME}/findListPage`,
    handler: async (request, reply) => {
      let params = {};
     const deleteKeys = ['page','limit','pagination']
     Object.keys(request.query).map(item=>{
       if(deleteKeys.indexOf(item)===-1)params[item] = request.query[item]
     })
     const total = await models[GROUP_NAME].find(params).countDocuments();
     const list = await models[GROUP_NAME].find(params).sort({'created':1}).skip((request.query.page - 1) * request.query.limit).limit(request.query.limit)
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
          openTime:Joi.date().description('时间'),
          open_id:Joi.string().description('用户唯一标识/暂非必填'),
          type:Joi.string().description('类型'),
          isFinish:Joi.boolean().description('是否完成'),
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
    await models.luckInfo.deleteMany()
    await models.usersJoinRecord.deleteMany()
    await models.userChangeRecord.deleteMany()
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
            // if(request.payload.conditionType=='2'){
            //   console.log('进来了')
            //   let time = new Date(request.payload.openTime);
            //   let scheduleTime = new Date(time.getFullYear(),time.getMonth(), time.getDate(), 8, 0, 0);
            //   console.log(scheduleTime,'!!');
            //  const j = schedule.scheduleJob(scheduleTime, () => {
            //     request({
            //       url:'https://www.saberc8.cn/luckDraws/finish?id='+res._doc._id,
            //       method:'GET'
            //   },()=>{
            //     // j.cancel();
            //   })
            //   })
            // }
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
            prize:Joi.object().required().description('奖品内容'),
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
