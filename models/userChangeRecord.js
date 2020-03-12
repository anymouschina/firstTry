//热评
module.exports = (mongoose) => mongoose.model(
    'userRecord',
    mongoose.Schema({
      type:String,//类型
      content:Object,//内容
      open_id:String,//用户标识
      needDeal:Boolean,//是否需要人工处理
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