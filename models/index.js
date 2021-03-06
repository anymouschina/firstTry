const fs = require('fs');
const path = require('path');
// const Sequelize = require('sequelize');
const mongoose = require('mongoose')
const configs = require('../config/config.js');
mongoose.set('useFindAndModify', false)
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = {
  ...configs[env],
  define: {
    underscored: true,
  },
};
// const develop = process.env.NODE_ENV&&process.env.NODE_ENV==='development';
const {isDevelop:develop} = require('../config')
!develop?mongoose.connect('mongodb://junmoxiao:junmoxiao@localhost/junmoxiao',{ useNewUrlParser: true,useUnifiedTopology: true }):mongoose.connect('mongodb://localhost:27017');
const con = mongoose.connection;
con.on('error', console.error.bind(console, '连接数据库失败'));
con.once('open',()=>{
    //成功连接
    console.log('连接成功')
})
const db = {};
fs
  .readdirSync(__dirname)
  .filter((file) => {
    const result = file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
    return result;
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(mongoose)
    console.log(file.slice(0,file.length-3),'载入成功')
    db[file.slice(0,file.length-3)] = model;
  });

db.mongoose = mongoose;

module.exports = db;
