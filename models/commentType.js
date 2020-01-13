//热评
module.exports = (mongoose) => mongoose.model(
    'commentType',
    mongoose.Schema({
        title:String,//标题
      content:String,//内容'
      type:String,//类型
      image:String,//图片
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