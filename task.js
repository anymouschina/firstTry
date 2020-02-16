
const models = require('./models')
const schedule = require('node-schedule');
var _filter={
    $or: [  // 多字段同时匹配
      {openTime: {$regex: keyword}}
    ]
  }
      const findTime = new Array(time.getFullYear(),(parseInt(time.getMonth()+1)<10?'0':'').concat(parseInt(time.getMonth()+1)),new String(time.getDate()+1)).join('-')
    await models.luckDraws.findOne({$or: [  // 多字段同时匹配
        {openTime: {$regex: findTime}}
      ]},function(err,doc){
        console.log(doc)
    })
// schedule.scheduleJob('30 7 * * *',async ()=>{
//     request({
//       url:'https://www.saberc8.cn/users/resetRegister',
//       method:'GET'
//     },()=>{console.log('每天7.30点置空签到时间')})
//     const time = new Date()
//     const findTime = new Array(time.getFullYear(),(parseInt(time.getMonth()+1)<10?'0':'').concat(parseInt(time.getMonth()+1)),new String(time.getDate()).concat('T00:00:00.000Z')).join('-')
//     await models.luckDraws.findOne({openTime:findTime},function(err,doc){
//       request({
//         url:'https://www.saberc8.cn/luckDraws/finish?id='+doc._id,
//         method:'GET'
//       },()=>{console.log('结束抽奖')})
//     })
//   })