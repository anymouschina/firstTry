//热评
module.exports = (mongoose) => mongoose.model(
    'descs',
    mongoose.Schema({
        andriodDesc:String,//安卓
        iosDesc:String//ios
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