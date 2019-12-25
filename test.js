const express =require('express')

const multer =require('multer')

const upload = multer({dest:__dirname+'/static/upload'})//设置上传的目录文件夹
const router = express()
router.post('/save',upload.single('file'),(req,res)=>{

  const data = {
  
           file:req.file,//获取到的文件
  
          message:req.body//获取到的表单数据
  
      }
  
  res.json(data)
  
  })
router.listen(3000)