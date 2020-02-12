
async function updateUser(models,content,callback=()=>{}){
    if(content.type===1){
      const userChangeRecord = await  new models.userChangeRecord({type:content.type,
            content,
            open_id:content.open_id,
        })
      const res =   await models.users.findOneAndUpdate({open_id:content.open_id,from:'1'},{
             $inc:{skinChipNum:content.num}
        })
        userChangeRecord.save()
        callback(res)
    }else{

    }
}
module.exports = {
    updateUser
}