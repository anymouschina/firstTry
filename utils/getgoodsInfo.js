const request = require('request')
let total = 200
const dealBarcode = (barcode,reply,models,open_id,join)=>request(`https://api.douban.com/v2/book/isbn/:${barcode}?apikey=0df993c66c0c636e29ecbb5344252a4a`,((urlErr,urlRes)=>{
        // request(`https://api.douban.com/v2/book/search?apikey=0df993c66c0c636e29ecbb5344252a4a&start=${Number.parseInt(Math.random()*1000%200)}&count=3&tag=${encodeURI('前端')}`,((urlErr,urlRes)=>{
        //     if(urlErr)throw urlErr
        //     else {
        //        console.log(JSON.parse(urlRes.body).books.map(item=>item.tags),'??')
                
        //     }
        // }))
        if(urlErr)throw urlErr
            else {
                // console.log(JSON.parse(urlRes.body))
                let imgUrl = JSON.parse(urlRes.body).images.small
                let obj = {...JSON.parse(urlRes.body),imgUrl,open_id,collected:!!join}
                // console.log(obj)
                if(obj.title==='Undefined'){
                    reply({
                        status:200,
                        error:'暂时找不到有关数据，已记录',
                        msg:'通过外部接口查询并存入数据库'
                    })
                }else{
                    let model = new models.goods(obj);
                    console.log(model,'??')
                    if(!!join)model.save()
                    reply({
                        status:200,
                        data:obj,
                        msg:'通过外部接口查询并存入数据库'
                    })
                }   
        }
}))
const dealBooks = (tags,count,reply)=>request(`https://api.douban.com/v2/book/search?apikey=0df993c66c0c636e29ecbb5344252a4a&start=${Number.parseInt(Math.random()*100000%(total-count))}&count=${count}&tag=${encodeURI(tags)}`,(urlErr,urlRes)=>{
        if(urlErr)throw urlErr
        else {
           let resBody = JSON.parse(urlRes.body);
           total = resBody.total;
           console.log(resBody.books,'???')
           reply({
            status:200,
            data:resBody.books,
            msg:'通过外部接口查询并存入数据库'
        })
        }
    })
const searchBooks = (q,count,reply,pageNo)=>request(`https://api.douban.com/v2/book/search?apikey=0df993c66c0c636e29ecbb5344252a4a&start=${(pageNo-1)*count}&count=${count}&q=${encodeURI(q)}`,(urlErr,urlRes)=>{
    if(urlErr)throw urlErr
    else {
        let resBody = JSON.parse(urlRes.body);
        total = resBody.total;
        reply({
        status:200,
        data:resBody.books,
        msg:'通过外部接口查询并存入数据库'
    })
    }
})
module.exports = {
    dealBarcode,
    dealBooks,
    searchBooks
}