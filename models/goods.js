module.exports = (mongoose) => mongoose.model(
    'goods',
    mongoose.Schema({
        goodsName:String,
        barcode:Number,
        price:Number,
        brand:String,
        supplier:String,
        standard:String,
        imgUrl:String
    },{timestamps: {
      createdAt: 'created',
      updatedAt: 'updated'
  }})
  );