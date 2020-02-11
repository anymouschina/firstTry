module.exports = (mongoose) => mongoose.model(
    'users',
    mongoose.Schema({
      nick_name: String,
      avatar_url: String,
      gender:Number,
      open_id: String,
      from:String,//来源
      skinChipNum:Number,//积分数
      useSkinChipNum:Number,//已使用积分
      session_key: String,
    },{timestamps: {
      createdAt: 'created',
      updatedAt: 'updated'
  }})
  );