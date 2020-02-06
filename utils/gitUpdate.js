const child_process = require('child_process');
const commandList = ['git pull','pm2 stop app.js','pm2 start app.js']
const len = commandList.length
function  updateGit(step = 0,callback){
    child_process.exec(commandList[step],(error,stdout)=>{
        if(error){
            console.log(error.stack);
            console.log('Error code: '+error.code);
            console.log('Signal received: '+error.signal);
            callback({
                result:error.stack
            })
        }
        if(len-1>step)updateGit(++step)
        else callback({
            result:stdout
        })
    })
}
module.exports = {
    updateGit
}
