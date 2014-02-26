var express = require("express");
var open = require('open');
var app = express();
app.use(express.static(__dirname));
app.listen(9988);
open('http://localhost:9988/src');