const request = require('request')

module.exports = (barcode,reply)=>request(`https://www.mxnzp.com/api/barcode/goods/details?barcode=${barcode}&appid=wx536dfc5d38954079&secret=ca008a164dfa01913a6ec8edbcbe2cf7`,((err,res)=>{
    if(err)throw err
    else {
        reply({
            status:200,
            data:res.body.data
        })
        // console.log(res.body)
    }
}))
