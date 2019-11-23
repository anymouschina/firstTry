const request = require('request')

module.exports = (barcode,reply,models)=>request(`https://www.mxnzp.com/api/barcode/goods/details?barcode=${barcode}&appid=wx536dfc5d38954079&secret=ca008a164dfa01913a6ec8edbcbe2cf7`,((err,res)=>{
    if(err)throw err
    else {
        let model = new models.goods(JSON.parse(res.body).data);
        model.save()
        reply({
            status:200,
            data:JSON.parse(res.body).data
        })
        // console.log(res.body)
    }
}))
