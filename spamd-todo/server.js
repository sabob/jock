var express = require("express");
var app = express();
console.log(app.settings.env)
app.use(express.static(__dirname));
app.listen(9988);