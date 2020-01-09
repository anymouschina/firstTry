//热评
module.exports = (mongoose) => mongoose.model(
    'hotComments',
    mongoose.Schema({
      title:String,//标题
      content:String,//内容
      comment:String,//评论数目
      type:String,//类型
      from:String//来源
     },{timestamps: {
      createdAt: 'created',
      updatedAt: 'updated'
  }}).static('random', function(callback){
    this.count(function(err,count){
      if(err){
        return callback(err)
      }
      const rand = Math.floor(Math.random()*count)
      this.findOne().skip(rand).exec(callback)
    }.bind(this))
  })
  );