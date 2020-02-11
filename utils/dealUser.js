
const models = require('../models')
async function updateUser(models,content){
    if(content.type===1){
      const userChangeRecord = await  new models.userChangeRecord({type:content.type,
            content,
            open_id:content.open_id,
        })
        userChangeRecord.save(
            models.users.findOneAndUpdate({open_id:content.open_id},
                 { $inc:{skinChipNum:content.num}} )
        )
        
    }else{

    }
}
module.exports = {
    updateUser
}