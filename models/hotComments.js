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
  }})
  );