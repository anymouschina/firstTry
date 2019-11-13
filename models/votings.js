//投票类型表
module.exports = (mongoose) => mongoose.model(
    'votings',
    mongoose.Schema({
      name:String,//主题分类
      left:{type: Number, default: 0},//支持0的总数
      right:{type: Number, default: 0},//支持1的总数
    })
  );