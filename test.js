
const request= require('superagent')
const cheerio = require('cheerio')
function get
request.get('http://www.soyunpan.com/search/%E9%BB%91%E9%95%9C-0-%E5%85%A8%E9%83%A8-0.html').end(function (err, sres,next) {
    if (err) {
        return next(err);
    }
    var $ = cheerio.load(sres.text);
    var items = [];
    $('.x-left-h3 a').each(function (index, element) {
        var $element = $(element);
        console.log($element)
        items.push({
            标题: $element.text(),
            网址: $element.attr('href')
        });
    });
    
});