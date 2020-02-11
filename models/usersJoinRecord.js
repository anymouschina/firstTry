//热评
module.exports = (mongoose) => mongoose.model(
    'usersJoinRecord',
    mongoose.Schema({
      nick_name:String,//抽奖人名字
      avatar_url: String,//抽奖人头像
      open_id: String,//抽奖人open_id
      luckDrawId:String,//参与抽奖
      title:String,//抽奖主题
     },{timestamps: {
      createdAt: 'created',
      updatedAt: 'updated'
  }}).static('random', function(callback,config){
    if(config)this.find(config,function(
      err,list
    ){
      const rand = Math.floor(Math.random()*list.length)
      this.findOne(config).skip(rand).exec(callback)
    }.bind(this))
  else{
    this.count(function(err,count){
      if(err){
        return callback(err)
      }
      const rand = Math.floor(Math.random()*count)
      this.findOne().skip(rand).exec(callback)
    }.bind(this))
  }
  })
  );