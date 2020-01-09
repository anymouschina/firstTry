const superagent = require('superagent')
const cheerio = require('cheerio')
function getHotComment(model,page,callback){
  superagent
  .get('https://www.musicbooks.cn/page/2')
  .end((err,res) => {
    const $ = cheerio.load(res.text);
    let list = []
     $('article').map((i,el)=>{
       const html = $(el).children()
       let textObj = {
         '0':'title',
         '1':'content',
         '2':'beizhu'
       }
       let result = {}
       html.map(index=>{
         result[textObj[index]] = $(html[index]).text().trim()
       })
       list.push(result)
     })
     callback(list)
  })
  
}
