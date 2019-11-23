const request = require('request')

module.exports = (barcode,reply,models,open_id)=>request(`https://www.mxnzp.com/api/barcode/goods/details?barcode=${barcode}&appid=wx536dfc5d38954079&secret=ca008a164dfa01913a6ec8edbcbe2cf7`,((err,res)=>{
    if(err)throw err
    else {
        request(`https://image.baidu.com/search/acjson?tn=resultjson_com&ipn=rj&ct=201326592&is=&fp=result&queryWord=${encodeURI(JSON.parse(res.body).data.goodsName)}&cl=2&lm=-1&ie=utf-8&oe=utf-8&adpicid=&st=-1&z=&ic=0&hd=&latest=&copyright=&word=${encodeURI(JSON.parse(res.body).data.goodsName)}&s=&se=&tab=&width=&height=&face=0&istype=2&qc=&nc=1&fr=&expermode=&force=&pn=0&rn=30&gsm=&1574480805679=`,((urlErr,urlRes)=>{
            if(urlErr)throw urlErr
            else {
                let imgUrl = JSON.parse(urlRes.body).data[0].middleURL
                let obj = {...JSON.parse(res.body).data,imgUrl,open_id}
                let model = new models.goods(obj);
                model.save()
                reply({
                    status:200,
                    data:obj,
                    msg:'通过外部接口查询并存入数据库'
                })
            }
        }))
        
        // console.log(res.body)
    }
}))
