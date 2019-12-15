const request = require('request')

module.exports = (barcode,reply,models,open_id)=>request(`https://www.mxnzp.com/api/barcode/goods/details?barcode=${barcode}&appid=wx536dfc5d38954079&secret=ca008a164dfa01913a6ec8edbcbe2cf7`,((err,res)=>{
    if(err)throw err
    else {
        request(`https://api.douban.com/v2/book/search?apikey=0df993c66c0c636e29ecbb5344252a4a&start=0&count=1&q=${encodeURI(JSON.parse(res.body).data.goodsName)}`,((urlErr,urlRes)=>{
            if(urlErr)throw urlErr
            else {
                let imgUrl = JSON.parse(urlRes.body).books[0].images.small
                let obj = {...JSON.parse(res.body).data,...JSON.parse(urlRes.body).books[0],imgUrl,open_id}
                console.log(obj,'??数据内容',JSON.parse(res.body))
                if(obj.title==='Undefined'){
                    reply({
                        status:200,
                        error:'暂时找不到有关数据，已记录',
                        msg:'通过外部接口查询并存入数据库'
                    })
                }else{
                    let model = new models.goods(obj);
                    console.log(model,'??')
                    model.save()
                    reply({
                        status:200,
                        data:obj,
                        msg:'通过外部接口查询并存入数据库'
                    })
                }
                
            }
        }))
    }
}))
