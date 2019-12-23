module.exports = (mongoose) => mongoose.model(
    'goods',
    mongoose.Schema({
        rating:Object,
        subtitle:String,
        author:Array,
        pubdate:String,
        tags:Array,
        origin_title:String,
        image:String,
        binding:String,
        translator:Array,//翻译
        catalog:String,//目录
        pages:String,//页数
        images:Object,
        alt:String,
        publisher:String,//发布
        isbn10:String,
        isbn11:String,
        isbn13:String,
        title:String,
        url:String,
        alt_title:String,
        author_intro:String,//作者简介
        summary:String,
        series:Object,
        price:String,
        goodsName:String,
        barcode:Number,
        brand:String,
        supplier:String,
        standard:String,
        imgUrl:String,
        open_id:String,
        collected:Boolean
    },{timestamps: {
      createdAt: 'created',
      updatedAt: 'updated'
  }})
  );