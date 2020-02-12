//热评
module.exports = (mongoose) => mongoose.model(
    'luckDraws',
    (()=>{
   let  Schema = new mongoose.Schema({
      title:String,//标题
      conditionType:String,//1皮肤,2碎片
      isFinish:Boolean,//是否结束
      openNum:Number,//开奖需要人数
      openTime:Date,//开奖时间
      userNum:Number,//当前人数
      pic:String,//图片
      prize:Object,//奖品信息
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
  Schema.virtual('waitFinish', {
    ref: 'usersJoinRecord', // The model to use
    localField: 'luckDrawId', // Find people where `localField`
    foreignField: '_id', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: false
  })
  return Schema
})()
  );