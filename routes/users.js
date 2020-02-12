const JWT = require('jsonwebtoken');
const config = require('../config');
const { paginationDefine } = require('../utils/router-helper');
const axios = require('axios');
const GROUP_NAME = 'users';
const Joi = require('joi')
const models = require('../models')
const decryptData = require('../utils/decrypt-data');
const sercretObj = require('../appsercrets')
async function userLogin(reply,from = 0,result = []){
  if(from == '1'){
    // const userJoin = await models.usersJoinRecord.find({open_id:result.openid})
    await models.luckDraws
    .aggregate([
      {
        $lookup: {
          from: "usersJoinRecord",
          localField: "_id",
          foreignField: "luckDrawId",
          as: "userJoin"
        },
        
      },
      {$sort:{'created':-1}},
      { $match: { isFinish: false}}
    ],function(err,docs){
      reply({result,luckDraws:JSON.stringify(docs)})
    })
    // .map(item=>{
    //  return item.map(n=>{
    //      return {
    //       ...n._doc,
    //       userJoin:userJoin.some(a=>n._doc._id==a.luckDrawId)
    //     }
    //  })
      
    // })
    
  }else{
    reply(result)
  }
}
module.exports = [{
  method: 'GET',
  path: `/${GROUP_NAME}/findUserList`,
  handler: async (request, reply) => {
    const query = models.users.find();
    const total = await query.countDocuments();
    const data = await query.find()
    .sort({'created':-1})
    .skip((request.query.page - 1) * request.query.limit).
    limit(request.query.limit);
    reply({
      status:200,
      total:total,
      data:data
      })
  },
  config: {
    tags: ['api', GROUP_NAME],
    description: '获取用户列表',
    auth: false, // 约定此接口不参与 JWT 的用户验证，会结合下面的 hapi-auth-jwt 来使用
    validate: {
      query: {
        ...paginationDefine,
      },
    }
  },
},
{
  method: 'GET',
  path: `/${GROUP_NAME}/userInfo`,
  handler: async (request, reply) => {
    const list = await models.users.find({open_id:request.query.open_id})
    reply({status:200,data:list[0]||'无此用户数据'});
  },
  config: {
    tags: ['api', GROUP_NAME],
    description: '获取用户列表',
    auth: false, // 约定此接口不参与 JWT 的用户验证，会结合下面的 hapi-auth-jwt 来使用
    validate: {
      query: {
        open_id:Joi.string().required().description('用户唯一标识'),
      },
    }
  },
},
{
  method: 'GET',
  path: `/${GROUP_NAME}/deleteUser`,
  handler: async (request, reply) => {
    const list = await models.users.deleteOne({open_id:request.query.openid}, function (err,res) {
      if(err)reply({status:200,data:'无此用户数据'});
      reply({status:200,data:res||'无此用户数据'});
    })
    
  },
  config: {
    tags: ['api', GROUP_NAME],
    description: '获取用户列表',
    auth: false, // 约定此接口不参与 JWT 的用户验证，会结合下面的 hapi-auth-jwt 来使用
    validate: {
      query: {
        openid:Joi.string().required().description('openid')
      },
    }
  },
},
{
  method: 'GET',
  path: `/${GROUP_NAME}/resetRegister`,
  handler: async (request, reply) => {
    await models.users.updateMany({},{$set:{todayRegister:false}}, function (err,res) {
      if(err)reply({status:200,data:'无此用户数据'});
      reply({status:200,data:res||'无此用户数据'});
    })
    
  },
  config: {
    tags: ['api', GROUP_NAME],
    description: '获取用户列表',
    auth: false, // 约定此接口不参与 JWT 的用户验证，会结合下面的 hapi-auth-jwt 来使用
  },
},
{
  method: 'GET',
  path: `/${GROUP_NAME}/getUserInfo`,
  handler: async (request, reply) => {
    const {appid,secret} = sercretObj[request.query.from];
    const response = await axios({
      url: 'https://api.weixin.qq.com/sns/jscode2session',
      method: 'GET',
      params: {
        appid,
        secret,
        js_code: request.query.code,
        grant_type: 'authorization_code',
      }
    });
    const list = await models.users.find({open_id:response.data.openid})
    reply({status:200,data:list[0]||'无此用户数据'});
  },
  config: {
    tags: ['api', GROUP_NAME],
    description: '获取用户列表',
    auth: false, // 约定此接口不参与 JWT 的用户验证，会结合下面的 hapi-auth-jwt 来使用
    validate: {
      query: {
        from:Joi.string().required().description('第几个app'),
        code:Joi.string().required().description('code')
      },
    }
  },
},
{
  method: 'POST',
  path: `/${GROUP_NAME}/createJWT`,
  handler: async (request, reply) => {
    const generateJWT = (jwtInfo) => {
      const payload = {
        userId: jwtInfo.userId,
        exp: Math.floor(new Date().getTime() / 1000) + 7 * 24 * 60 * 60,
      };
      return JWT.sign(payload, config.jwtSecret);
    };
    reply(generateJWT({
      userId: 1,
    }));
  },
  config: {
    tags: ['api', GROUP_NAME],
    description: '用于测试的用户 JWT 签发',
    auth: false, // 约定此接口不参与 JWT 的用户验证，会结合下面的 hapi-auth-jwt 来使用
  },
},
{
  method: 'POST',
  path: `/${GROUP_NAME}/login`,
  handler: async (req, reply) => {
    // const appid = config.wxAppid; // 你的小程序 appid
    // const secret = config.wxSecret; // 你的小程序 appsecret
    const userInfo = req.payload.updateData
    const from = req.payload.from;
    const {appid,secret} = sercretObj[req.payload.from];
    const { code } = req.payload;
    console.log(req.payload,appid,secret,'用户登录了')
    const response = await axios({
      url: 'https://api.weixin.qq.com/sns/jscode2session',
      method: 'GET',
      params: {
        appid,
        secret,
        js_code: code,
        grant_type: 'authorization_code',
      }
    });
    // response 中返回 openid 与 session_key
    const { openid, session_key: sessionKey } = response.data;
    // 基于 openid 查找或创建一个用户
  await models.users.find(
     { open_id: openid,from },
  ).then(userResponse=>{
    if(userResponse.length===0){
      console.log('???走到这里了')
      const userModel = new models.users({
        nick_name: userInfo.nickName,
        avatar_url: userInfo.pic,
        open_id: openid,
        from,
        skinChipNum:0,
        useSkinChipNum:0,
        registerNum:0,
        todayRegister:false,
        session_key: sessionKey,
      })
      console.log('???')
    userModel.save(function (err,res) {
        if (err) console.log(err)
        // saved!
        else {
          // console.log('用户未在库中找到，新建成功',from)
          userLogin(reply,from,{user:res[0],openid})
      }
      })
    }else{
      console.log('用户找到了')
      models.users.findOneAndUpdate({open_id:openid,from},{
        nick_name: userInfo.nickName,
        avatar_url: userInfo.pic,
        open_id: openid,
        session_key: sessionKey,
      })
      // console.log('用户在库中找到，登录',userResponse)
      userLogin(reply,from,{user:userResponse[0],openid})
    }
  })
},
  config: {
    auth: false, // 不需要用户验证
    tags: ['api', GROUP_NAME], // 注册 swagger 文档
    validate: {
      payload: {
        code: Joi.string().required().description('微信用户登录的临时code'),
        from: Joi.number().required().description('小程序标识'),
        updateData:Joi.object().required().description('用户名称以及头像'),
        skinChipNum:Joi.number().description('皮肤碎片数目')
      },
    },
  },
},
{
  method: 'POST',
  path: `/${GROUP_NAME}/wxLogin`,
  handler: async (req, reply) => {
    // const appid = config.wxAppid; // 你的小程序 appid
    // const secret = config.wxSecret; // 你的小程序 appsecret
    const {appid,secret} = sercretObj[req.payload.from];
    const { code, encryptedData, iv } = req.payload;
    console.log(req.payload,appid,secret,'用户登录了')
    const response = await axios({
      url: 'https://api.weixin.qq.com/sns/jscode2session',
      method: 'GET',
      params: {
        appid,
        secret,
        js_code: code,
        grant_type: 'authorization_code',
      }
    });
    console.log(response,'???')
    // response 中返回 openid 与 session_key
    const { openid, session_key: sessionKey } = response.data;
    console.log(openid,sessionKey,'返回的数据')
    // 基于 openid 查找或创建一个用户
  if(encryptedData&&iv){
  const userInfo = decryptData(encryptedData, iv, sessionKey, appid);
   // 签发 jwt
   const generateJWT = (jwtInfo) => {
    const payload = {
      userId: jwtInfo.userId,
      exp: Math.floor(new Date().getTime() / 1000) + 7 * 24 * 60 * 60,
    };
    return JWT.sign(payload, config.jwtSecret);
  };
  const replyJWT = (userId,OPEN_ID)=>{
    reply({SESSION_KEY:generateJWT({
      userId: userId
    }),
    OPEN_ID:OPEN_ID
  }
    )
  }
  await models.users.find(
     { open_id: openid },
  ).then(userResponse=>{
    if(userResponse.length===0){
      console.log('???走到这里了')
      const userModel = new models.users({
        nick_name: userInfo.nickName,
        gender: userInfo.gender,
        avatar_url: userInfo.avatarUrl,
        open_id: openid,
        session_key: sessionKey,
      })
      console.log('???')
    userModel.save(function (err,res) {
        if (err) console.log(err)
        // saved!
        else {
          console.log('用户未在库中找到，新建成功',res)
          replyJWT(res._id,openid)
      }
      })
    }else{
      console.log('用户找到了')
      models.users.findOneAndUpdate({open_id:openid},{
        nick_name: userInfo.nickName,
        gender: userInfo.gender,
        avatar_url: userInfo.avatarUrl,
        open_id: openid,
        session_key: sessionKey,
      })
      console.log('用户在库中找到，登录',userResponse)
      replyJWT(userResponse[0]._id,openid);
    }
  })
  }else{
    reply({OPEN_ID:openid})
  }
},
  config: {
    auth: false, // 不需要用户验证
    tags: ['api', GROUP_NAME], // 注册 swagger 文档
    validate: {
      payload: {
        code: Joi.string().required().description('微信用户登录的临时code'),
        encryptedData: Joi.string().description('微信用户信息encryptedData'),
        iv: Joi.string().description('微信用户信息iv'),
        // appid:Joi.string().required().description('你的小程序appid'),
        // secret:Joi.string().required().description('你的小程序secret')
        from: Joi.number().required().description('小程序标识')
      },
    },
  },
}];
