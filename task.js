
const models = require('./models')
const schedule = require('node-schedule');
const qs = require('qs')
const request = require('request')
const moment = require('moment');
const picArr = ['https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=3586890526,570354557&fm=26&gp=0.jpg',
'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=867186494,2167114166&fm=26&gp=0.jpg',
'https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=39295240,1628234680&fm=26&gp=0.jpg',
'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=4278859854,1726365617&fm=26&gp=0.jpg',
'https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=3901402791,2028026857&fm=26&gp=0.jpg',
'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=1375989626,3172401837&fm=26&gp=0.jpg',
'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=2928597390,4043951486&fm=26&gp=0.jpg'
]
try {
  schedule.scheduleJob('30 7 * * *',async ()=>{
    request({
      // url:'http://localhost:3000/users/resetRegister',
      url:'https://www.saberc8.cn/users/resetRegister',
      method:'GET'
    },async()=>{console.log('每天7.30点置空签到时间')
    let d1 = new Date(moment(new Date()).format('YYYY-MM-DD'));
    let d2 = new Date(moment(new Date()).add(1, 'days').format('YYYY-MM-DD'));
    await models.luckDraws.find({openTime:{
        $gte: d1,
        $lt: d2
    },isFinish:false}).then(
      (res)=>{
        console.log(res,'今日的')
      res.map(doc=>{
        request({
          url:'https://www.saberc8.cn/luckDraws/finish?id='+doc._doc._id,
          // url:'http://localhost:3000/luckDraws/finish?id='+doc._doc._id,
          method:'GET'
        },()=>{
          console.log('1111')
            request({
              url:'https://www.saberc8.cn/luckDraws/create',
              // url:'http://localhost:3000/luckDraws/create',
              method:'POST',
              headers:{'Content-Type':'application/json'},
              body:JSON.stringify({
                  "title": "20碎片*5份",
                  "prize": {"num":5,"price":30},
                  "conditionType": "2",
                  "isFinish": false,
                  "openTime": new Date(moment(new Date()).add(5, 'days').format('YYYY-MM-DD')),
                  "pic": picArr[new Date().getDay()],
                  "peopleGroup": [
                  
                  ]
                })
            },(reply,res)=>{
              console.log(reply,res,'创建结果')
            })
        })
      })
    })
  })
   
  })
} catch (error) {
  console.log(error,'111')
}