
async function updateUser(models,content,callback=()=>{}){
    if(content.type==1&&content.title.indexOf('签到')===-1){
        console.log(1)
      const userChangeRecord = await  new models.userChangeRecord({
            ...content
        })
      const res =   await models.users.findOneAndUpdate({open_id:content.open_id},{
             $inc:{skinChipNum:content.num}
        })
        console.log(1111)
        userChangeRecord.save(callback(res))
        
    }else{
        callback()
    }
}
module.exports = {
    updateUser
}