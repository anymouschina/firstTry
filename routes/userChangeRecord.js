const Joi = require('joi');
const { paginationDefine } = require('../utils/router-helper');
const models = require('../models');
const { env } = process;
const {updateUser} = require('../utils/dealUser')
const GROUP_NAME = 'userChangeRecord';

module.exports = [
  {
    method: 'GET',
    path: `/${GROUP_NAME}/findListPage`,
    handler: async (request, reply) => {
     const {open_id,type} = request.query;
     let params = {}
     if(open_id){params.open_id = open_id}
     if(type) params.type = type
     const total = await models[GROUP_NAME].find(params).countDocuments();
     const list = await models[GROUP_NAME].find(params).sort({'created':-1}).skip((request.query.page - 1) * request.query.limit).limit(request.query.limit)
     const pages = total/request.query.limit
     const addNum = (total%request.query.limit===0)?0:1
      reply({
         status:200,
         data:list,
         total,
         pages:parseInt(pages)+parseInt(addNum)
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
            const params = {...request.payload,...request.payload.content}
            updateUser(models,params,async ()=>{
              models.users.findOne({open_id:request.payload.open_id,from:'1'},async function (err, user) {
                if (err) reply.status(500).send({status:500,err});
                else{
                  if(request.payload.content.title.indexOf('签到')>-1&&!user.todayRegister){
                    user.registerNum ++;
                    user.todayRegister = true;
                    user.skinChipNum += request.payload.content.num
                    const userChangeRecord = await  new models.userChangeRecord({
                          type:params.type,
                          params,
                          open_id:params.open_id,
                      })
                      userChangeRecord.save()
                  }else if(request.payload.content.num<-1){
                    user.useSkinChipNum += Math.abs(request.payload.content.num)
                  }
                  user.save(reply({
                    status:200,
                    data:user
                  }))
                }
              });
          //   let res =  await models.users.findOneAndUpdate({open_id:request.payload.open_id,from:'1'},{
          //       $inc:{registerNum:1},
          //       $set:{todayRegister:true}
          //  })
              
      })
    },
    config: {
      tags: ['api', GROUP_NAME],
      auth:false,
      description: '新建用户记录',
      validate: {
        payload: {
           type:Joi.string().required().description('变更类型，0为兑换，1为碎片，2为皮肤'),//抽奖人名字
           content: Joi.object().required().description('变更对象'),//抽奖人头像
           open_id:Joi.string().required().description('open_id'),//抽奖人Id
        },
      },
    },
  },
  {
    method: 'POST',
    path: `/${GROUP_NAME}/allRecord`,
    handler: async (request, reply) => {
         try {
           // const params = {...request.payload,...request.payload.content}
           let list = await  models.users.find({},'open_id')
           const luckerRecord = await models.userChangeRecord.insertMany(list.map(item=>{
             return {
               type:'1',
               content:{num:request.payload.num,title:request.payload.title},
               open_id:item._doc.open_id
             }
           }))
           reply({list,luckerRecord})
         } catch (error) {
           console.log(error)
         }
           
    },
    config: {
      tags: ['api', GROUP_NAME],
      auth:false,
      description: '新建用户记录',
      validate: {
        payload: {
           title:Joi.string().required().description('标题'),//抽奖人名字
           num: Joi.number().required().description('数目'),//抽奖人头像
          
        },
      },
    },
  }
];
