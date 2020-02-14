// const { exec } = require('child_process');
// const shellOrder = 'sh /home/wwwroot/code/node.sh';
// const request = require('request')
const schedule = require('node-schedule')
console.log(new Date('2020','1','1').getMonth())
var date = new Date(2020, 1, 14, 8, 0, 0);
var j = schedule.scheduleJob(date, function(){
    console.log('今天被ren认出来了!');
  });