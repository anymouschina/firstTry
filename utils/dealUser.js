
const models = require('../models')
async function updateUser(models,content){
    if(content.type===1){
      const userChangeRecord = await  new models.userChangeRecord({type:content.type,
            content,
            open_id:content.open_id,
        })
      const res =   await models.users.findOneAndUpdate({open_id:content.open_id,from:'1'},{
             $inc:{skinChipNum:content.num}
        })
        console.log(res,'更新')
        userChangeRecord.save()
        
    }else{

    }
}
module.exports = {
    updateUser
}