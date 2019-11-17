//投票
module.exports = (mongoose) => mongoose.model(
    'votingOrder',
    mongoose.Schema({
      user: String,//用户名
      open_id:String,//openid
      choosed: String,//选择 0 1
      name:String,//投票主题
      state:{type:Boolean,default:false}
    },{timestamps: {
      createdAt: 'created'
  }})
  );