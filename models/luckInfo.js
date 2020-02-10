//热评
module.exports = (mongoose) => mongoose.model(
    'luckInfo',
    mongoose.Schema({
      luckDraw:Object,//抽奖详情
      luckDrawPeople:Array,//参与人
      luckers:Array,//中奖人
      userLuckDraw:String,//文字提示
      _id:String
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