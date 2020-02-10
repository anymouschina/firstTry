const param = process.argv[2];
const file = require('./models/index.js')
console.log(file[param].prototype,'!!')