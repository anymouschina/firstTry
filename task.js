
const models = require('./models')
const schedule = require('node-schedule');
const moment = require('moment')
const LastUpdateAt = moment(new Date()).format('YYYY-MM-DD')
let d1 = new Date(moment(new Date()).add(1, 'days').format('YYYY-MM-DD'));
            let d2 = new Date(moment(new Date()).add(2, 'days').format('YYYY-MM-DD'));
    let as = async function(){
      let s = await  models.luckDraws.find({openTime:{
            $gte: d1,
            $lt: d2
        }})
        console.log(s,d1,d2,'??')
    }
    as()
    
            // console.log(luckDraws,'??')
            // console.log(moment(parseInt(LastUpdateAt, 10)).format('YYYY-MM-DD'))
            // console.log(parseInt(LastUpdateAt, 10))
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