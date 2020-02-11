
const models = require('../models')
function updateUser(models,content){
    if(content.type===1){
      const userChangeRecord =  new models.userChangeRecord({type:content.type,
            content,
            open_id:content.open_id,
        })
        userChangeRecord.save()
        updateUserInfo(content.open_id,{skinChipNum:(num)=>{return num + content.num}})
    }else{

    }
}
function updateUserInfo(open_id,content){//更新用户表数据
    models.users.find({open_id:open_id},(err,doc)=>{
        Object.keys(content).map(item=>{
            doc[item] = content[item](doc[item])
        })
        doc.save()
    })
}
module.exports = {
    updateUser
}