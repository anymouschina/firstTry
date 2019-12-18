const request = require('request')
// 
// ${Number.parseInt(Math.random()*1000%200)}
function test(barcode,reply,models,open_id){
    console.log(barcode,'??')
    request(`https://api.douban.com/v2/book/isbn/:${barcode}?apikey=0df993c66c0c636e29ecbb5344252a4a`,(err,res)=>{
        console.log(JSON.parse(res.body))
            if(err)throw err
            // else {
            //     console.log(res)
            //     request(`https://api.douban.com/v2/book/search?apikey=0df993c66c0c636e29ecbb5344252a4a&start=0&count=3&isbn=9787111135104`,((urlErr,urlRes)=>{
            //         if(urlErr)throw urlErr
            //         else {
            //         //    console.log(JSON.parse(urlRes.body).books.map(item=>item),'??')
            //             console.log(JSON.parse(urlRes.body))
            //         }
            //     }))
            // }
    })
}
test(9787111630548)