const superagent = require('superagent')
const cheerio = require('cheerio')
function getHotComment(model,page,callback){
  superagent
  .get('https://flash-api.jin10.com/get_flash_list?max_time=2020-01-12+21%3A36%3A15&channel=-8200')
  .end((err,res) => {
    console.log(res.text)
    // const $ = cheerio.load(res.text);
    // let list = []
    //  $('article').map((i,el)=>{
    //    const html = $(el).children()
    //    let textObj = {
    //      '0':'title',
    //      '1':'content',
    //      '2':'beizhu'
    //    }
    //    let result = {}
    //    html.map(index=>{
    //      result[textObj[index]] = $(html[index]).text().trim()
    //    })
    //    list.push(result)
    //  })
    //  callback(list)
  })
  
}
superagent
  .get('https://flash-api.jin10.com/get_flash_list?max_time=2020-01-12+21%3A36%3A15&channel=-8200')
  .set('access-control-allow-origin','https://www.jin10.com')
  .withCredentials()
  .end((err,res) => {
    console.log(res)
    // const $ = cheerio.load(res.text);
    // let list = []
    //  $('article').map((i,el)=>{
    //    const html = $(el).children()
    //    let textObj = {
    //      '0':'title',
    //      '1':'content',
    //      '2':'beizhu'
    //    }
    //    let result = {}
    //    html.map(index=>{
    //      result[textObj[index]] = $(html[index]).text().trim()
    //    })
    //    list.push(result)
    //  })
    //  callback(list)
  })
