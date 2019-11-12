const express = require('express');
const app = express()
app.use(express.static('test'))
app.listen(3000)