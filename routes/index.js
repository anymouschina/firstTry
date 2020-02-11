const fs = require('fs')
const path = require('path')
const routes = {}
const basename = path.basename(__filename);
fs
  .readdirSync(__dirname)
  .filter((file) => {
    const result = file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
    return result;
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))
    console.log(file.slice(0,file.length-3),'路由载入成功')
    routes[file.slice(0,file.length-3)] = model;
  });
const outRoutes = [];
 Object.keys(routes).map(item=>{
    outRoutes.push(...routes[item])
})
module.exports = {
    outRoutes
}