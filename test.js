const request = require('request')
request(`https://image.baidu.com/search/acjson?tn=resultjson_com&ipn=rj&ct=201326592&is=&fp=result&queryWord=${encodeURI('计算机程序的构造和解释：原书第2版')}&cl=2&lm=-1&ie=utf-8&oe=utf-8&adpicid=&st=-1&z=&ic=0&hd=&latest=&copyright=&word=${encodeURI('计算机程序的构造和解释：原书第2版')}&s=&se=&tab=&width=&height=&face=0&istype=2&qc=&nc=1&fr=&expermode=&force=&pn=0&rn=30&gsm=&1574480805679=`,((err,res)=>{
    if(err)throw err
    else {
        // reply(res.body)
        console.log(JSON.parse(res.body).data[0].middleURL)
    }
}))