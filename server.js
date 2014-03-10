var express = require("express");
var open = require('open');

var app = express();
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({secret: '1234567890QWERTY'}));

app.get("/", checkAuth, function(req, res) {
    res.redirect("/index.html");
});

app.get('/data/person.json', checkAuth, function(req, res) {
    //var body = "hello";
    //res.setHeader('Content-Type', 'application/json');
    var sleep = 2000;
    setTimeout(function() {
        res.sendfile("." + req.path);

    }, sleep);
    //res.setHeader('Content-Length', Buffer.byteLength(body));
    //res.end(body);
});

function checkAuth(req, res, next) {
    if (!req.session.user_id) {
        res.send('You are not authorized to view this page');
        res.redirect("/login.html");
    } else {
        next();
    }
}

app.post('/login', function(req, res) {
    var post = req.body;
    if (post.user == 'test' && post.password == 'test') {
        req.session.user_id = 'test';
        res.redirect('/index.html');
        // Simulate J2EE server continuing orig request
        //res.redirect('/data/person.json');
    } else {
        res.send('Bad user/pass');
    }
});

app.get('/logout', function(req, res) {
    delete req.session.user_id;
    res.redirect('/login.html');
});

app.use(express.static(__dirname));
app.listen(9988);
open('http://localhost:9988/');