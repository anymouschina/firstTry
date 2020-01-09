const superagent = require('superagent')
const cheerio = require('cheerio')
const models = require('../models')
function getHotComment(models,page,callback,size){
  superagent
  .get(`https://www.musicbooks.cn/page/${page}`)
  .end((err,res) => {
      if(err) return console.log(page,'此页数出问题了')
    const $ = cheerio.load(res.text);
    let list = []
     $('article').map(async(i,el)=>{
       const html = $(el).children()
       let textObj = {
         '0':'title',
         '1':'content',
         '2':'comment'
       }
       let result = {}
       html.map(index=>{
         result[textObj[index]] = $(html[index]).text().trim()
       })
       const commentModel = new models.hotComments(result)
         await  commentModel.save(function (err,res) {
            if (err) console.log(err)
            // saved!
            else {
            console.log('新建成功',res)
        }
        })
       list.push(result)
     })
     page++;
     if(page<=size)getHotComment(models,page,callback,size)
     callback(list)
  })
  
}
getHotComment(models,1,(list)=>{console.log(`入库${list.length}个`)},166)