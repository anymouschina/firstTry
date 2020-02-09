//热评
module.exports = (mongoose) => mongoose.model(
    'luckDraws',
    mongoose.Schema({
      title:String,//标题
      conditionType:String,//1皮肤,2碎片
      isFinish:Boolean,//是否结束
      openNum:Number,//开奖需要人数
      openTime:Date,//开奖时间
      pic:String,//图片
      peopleGroup:Array,//参与人列表
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