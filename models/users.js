module.exports = (mongoose) => mongoose.model(
    'users',
    mongoose.Schema({
      nick_name: String,
      avatar_url: String,
      gender:Number,
      open_id: String,
      session_key: String,
    },{timestamps: {
      createdAt: 'created',
      updatedAt: 'updated'
  }})
  );