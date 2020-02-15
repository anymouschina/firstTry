// const { exec } = require('child_process');
// const shellOrder = 'sh /home/wwwroot/code/node.sh';
// const request = require('request')
const schedule = require('node-schedule')
// console.log(new Date('2020','1','1').getMonth())
let time = new Date('2020-2-15')
console.log(time.getFullYear(),time.getMonth(), time.getDate(),'??')
var date = new Date(time.getFullYear(),time.getMonth(), time.getDate(), 10, 37, 0);
// console.log(date,'??')
var j = schedule.scheduleJob(date, function(){
    console.log('今天被ren认出来了!');
  });
  console.log(j)