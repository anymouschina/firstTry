const request = require('request')
const fs = require('fs')
  class WriteApiToFile{
    constructor(){
     
    }
    createFile(filename,data,type,callback){
        fs.writeFileSync(filename,data,type,callback)
    }
    requestToSwagger(url,callback){
        request(url,callback)
    }
    //首字母大写
    toUpperCaseFirst(str){
      return  str.replace(/\b\w+\b/g,(word)=>{
            return  word.substring(0,1).toUpperCase() + word.substring(1);
        })
    }
    //驼峰
    toTitleCase(apiName,subKey){
          if(apiName.length>1){
                        if(apiName[apiName.length-1]==='findList'){
                            let reg =/[A-Z]/
                            let index =apiName[apiName.length-1].search(reg)
                            apiName = apiName [apiName.length-1].replace(/\b\w+\b/g,(word)=>{
                                return word.substring(0,index)+this.toUpperCaseFirst(apiName[apiName.length-2])+word.substring(index,index+1).toUpperCase() + word.substring(index+1);
                            })
                        }else{
                            if(subKey === 'get'){
                                apiName = 'get' + this.toUpperCaseFirst(apiName[apiName.length-1])
                             }else{
                                 let reg =/[A-Z]/
                                let index =apiName[apiName.length-1].search(reg)
                                if(index > -1){
                                    apiName = apiName[apiName.length-1].replace(/\b\w+\b/g,(word)=>{
                                    return  word.substring(0,index)+word.substring(index,index+1).toUpperCase() + word.substring(index+1);
                                })
                              }else{
                                    apiName = apiName[apiName.length-1] + this.toUpperCaseFirst(apiName[apiName.length-2])
                                }
                                
                             }
                        }     
                        
                    }
                    return apiName
    }
}
function getApiFile(baseUrl,type,callback){
    
//   const baseUrl = "https://petstore.swagger.io/v2/swagger.json"
//请求swagger服务
const writeApi = new WriteApiToFile()
const defaultText = `import { axios } from "axios";\nconst microStr = '';\n`
   
// let type = 'json'
if(type!=='json'){writeApi.requestToSwagger(`${baseUrl}/swagger-resources`,(error,response,body)=>{
    let result = JSON.parse(body)
    let errCollect = [];
    let successList = []
    for(let i = 0,j = result.length;i < j; i++){
         let currentFileName = result[i].name.split('-').pop();
        if(result[i].name.indexOf('api-hclp')===-1){
            console.log(result[i].name,'非api-hclp服务不生成')
            continue;
        }//非api-hclp打头不处理
        //  let urlImport = `const microStr = microSetting['${currentFileName}'];\n`
          writeApi.requestToSwagger(`${baseUrl}/${result[i].name}/v2/api-docs`,(err,res,responseUrl)=>{
              if(responseUrl[0]==='<'){
                  errCollect.push({
                      url:`${baseUrl}/${result[i].name}/v2/api-docs`,
                      describe:'此接口获取失败'
                  })
                  writeApi.createFile('src/api/'+currentFileName+'.js','该接口404','utf8',(err)=>{
                    console.log(err)
                 })
              }else{
                let resultUrlList = JSON.parse(responseUrl)
                let currentFileApiStr = ''
                let apiNameList = []
                if(!resultUrlList.basePath){//异常服务
                    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~服务异常,可在src/api/errorlog.json内查看~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
                    fs.exists('src/api/'+'errorlog'+'.json',(exists)=>{
                        if(exists){
                            fs.readFile('src/api/'+'errorlog'+'.json','utf8',(err,data)=>{
                                console.log(data)
                                writeApi.createFile('src/api/'+'errorlog'+'.json',data+JSON.stringify(resultUrlList)+'\n','utf8',(err1)=>{
                                    console.log(err1)
                              })
                          })
                        }else{
                            writeApi.createFile('src/api/'+'errorlog'+'.json',JSON.stringify(resultUrlList)+'\n','utf8',(err)=>{
                                console.log(err)
                          })
                        }
                    })
                }
                console.log(resultUrlList.basePath,'处理成功')
                successList.push(resultUrlList.basePath)
                for(let key in resultUrlList.paths){
                    for(let subKey in resultUrlList.paths[key]){
                      let apiName = key.slice(1).split('/').join('_')
                      let paramsConfig = {body:[],query:[],path:[]}
                      if(toString.call(resultUrlList.paths[key][subKey].parameters)==='[object Array]'){
                          resultUrlList.paths[key][subKey].parameters.map(item=>{
                            if(['body','query','path'].indexOf(item.in)>-1)paramsConfig[item.in].push(item.name);
                        })
                      }
                      //开启驼峰命名
                      // apiName = writeApi.toTitleCase(key.slice(1).split('/'),subKey);
                      let dataType = subKey === 'get' ? 'params':'data'
                      let rowData
                      if(apiName.indexOf('Export')>-1 || apiName.indexOf('export')>-1 || apiName.indexOf('download')>-1){
                      rowData = `const ${apiName} = (${dataType},config) => {return axios({url:microStr+'${key}',method: '${subKey}',${dataType},config})}//${resultUrlList.paths[key][subKey].summary}\n`                           
                      }
                      else{
                        rowData = `const ${apiName} = data => {return axios({url:microStr+\`${key+(paramsConfig.query.length>0?'?'+paramsConfig.query.map(item=>{return item+'='+'${data.'+item+'}'}).join('&'):'')}\`,method: '${subKey}',data})}//${resultUrlList.paths[key][subKey].summary}\n`   
                        if(paramsConfig.path.length>0) rowData = `const ${apiName} = data => {return axios({url:microStr+\`${key.replace(/{[^=}]+(?=})/gi,(item)=>'${data.'+item.slice(1))}\`,method: '${subKey}',data})}//${resultUrlList.paths[key][subKey].summary}\n`   
                      }
                      if(rowData.match(/[_|\/]{[^=}]+}/g)&&rowData.match(/[_|\/]{[^=}]+}/g).length>0){
                        rowData.match(/[_|\/]{[^=}]+}/g).map(item=>{
                        if(item.indexOf('/')>-1){
                          rowData = rowData.replace(item,'/')
                        }else if(item.indexOf('_')>-1){
                          rowData = rowData.replace(item,'')
                        }
                    })
                    apiName = apiName.replace(/_{[^=}]+}/g,'')
                }
                      currentFileApiStr += rowData
                    //   console.log(rowData)
                      apiNameList.push(apiName)
                    }
                }
                let exportContent = `export {${apiNameList.join(',')}}`
                  writeApi.createFile('src/api/'+currentFileName+'.js',defaultText  + currentFileApiStr +exportContent,'utf8',(err)=>{
                          console.log(err)
               })
              }
        })
    }
})
}
else {
    console.log(baseUrl,'!!!')
  writeApi.requestToSwagger(`${baseUrl}`,(err,res,responseUrl)=>{
      let json = JSON.parse(responseUrl)
      let currentFileApiStr = ''
      let apiNameList = []
          for(let key in json.paths){
                    for(let subKey in json.paths[key]){
                      let apiName = key.slice(1).split('/').join('_')
                      let paramsConfig = {body:[],query:[],path:[]}
                      if(toString.call(json.paths[key][subKey].parameters)==='[object Array]'){
                          json.paths[key][subKey].parameters.map(item=>{
                            if(['body','query','path'].indexOf(item.in)>-1)paramsConfig[item.in].push(item.name);
                        })
                      }
                      //开启驼峰命名
                      // apiName = writeApi.toTitleCase(key.slice(1).split('/'),subKey);
                      let rowData
                        rowData = `const ${apiName} = data => {return axios({url:microStr+\`${key+(paramsConfig.query.length>0?'?'+paramsConfig.query.map(item=>{return item+'='+'${data.'+item+'}'}).join('&'):'')}\`,method: '${subKey}',data})}//${json.paths[key][subKey].summary}\n`   
                        if(paramsConfig.path.length>0) rowData = `const ${apiName} = data => {return axios({url:microStr+\`${key.replace(/{[^=}]+(?=})/gi,(item)=>'${data.'+item.slice(1))}\`,method: '${subKey}',data})}//${json.paths[key][subKey].summary}\n`  
                        console.log(rowData)
                      if(rowData.match(/[_|\/]{[^=}]+}/g)&&rowData.match(/[_|\/]{[^=}]+}/g).length>0){
                        rowData.match(/[_|\/]{[^=}]+}/g).map(item=>{
                        if(item.indexOf('/')>-1){
                          rowData = rowData.replace(item,'/')
                        }else if(item.indexOf('_')>-1){
                          rowData = rowData.replace(item,'')
                        }
                    })
                    apiName = apiName.replace(/_{[^=}]+}/g,'')
                }
                      currentFileApiStr += rowData
                    //   console.log(rowData)
                      apiNameList.push(apiName)
                     
                      
                    //   writeApi.createFile('default.js',defaultText + currentFileApiStr +exportContent,'utf8',(err)=>{
                    //     console.log(err)
                    //   })
                    }
                    
                }
                let exportContent = `export {${apiNameList.join(',')}}`
                 callback(defaultText + currentFileApiStr +exportContent)

  })
}
}
module.exports = {
  getApiFile
}