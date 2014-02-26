var express = require("express");
var open = require('open');
var app = express();
console.log(app.settings.env)
app.use(express.static(__dirname));
app.listen(9988);
open('http://localhost:9988/src');