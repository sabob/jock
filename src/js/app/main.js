define(function(require) {
    var $ = require("jquery");
    var Intro = require("./views/intro/Intro");
    var Home = require("./views/home/Home");
    var Docs = require("./views/docs/Docs");
    var API = require("./views/api/API");
    var footer = require("hb!./views/footer/footer.htm");
    var viewManager = require("spamd/view/view-manager");
    var prettify = require("prettify");
    require("domReady!");

    viewManager.setGlobalOnAttached(function() {
        prettify.prettyPrint();
    });

    $("#home").click(function(e) {
        e.preventDefault();
        viewManager.showView({view: Home});
    });

    $("#intro").click(function(e) {
        e.preventDefault();
        viewManager.showView({view: Intro});
    });

    $("#menu-home").click(function(e) {
        e.preventDefault();
        viewManager.showView({view: Home});
        //var link = e.target;
        //setActiveMenu(link);

    });

    $("#menu-intro").click(function(e) {
        e.preventDefault();
        viewManager.showView({view: Intro});
        //var link = e.target;
        //setActiveMenu(link);
    });

    $("#menu-docs").click(function(e) {
        e.preventDefault();
        viewManager.showView({view: Docs});
        //var link = e.target;
        //setActiveMenu(link);
    });

    $("#menu-api").click(function(e) {
        e.preventDefault();
        var promise = viewManager.showView({view: API});
        promise.attached.then(function() {
            console.log("attached DEFAULT done", $(".toc").position());
        });
        console.log("promise", promise);
        promise.visible.then(function() {
            console.log("onVisible done", $(".toc").position());
        });
        //var link = e.target;
        //setActiveMenu(link);
    });

    $("#menu-download").click(function(e) {
        e.preventDefault();
        viewManager.showView({view: Intro});
        //var link = e.target;
        //setActiveMenu(link);
    });
console.log("MAIN: ShowHTML footer");
    var promise = viewManager.showHTML({html: footer, target: "#footer-holder"});
    /*
    var promise = viewManager.showHTML({html: footer, target: "#footer-holder"});
    promise.attached.then(function() {
        console.log("showHtml attached then");
        return promise.visible;
    } , function() {
        console.log("showHtml attached FAIL");
    }).then(function() {
        console.log("showHtml visible then");
        return promise;
    } , function() {
        console.log("showHtml visible FAIL");
    }).then(function() {
        console.log("showHtml main then");
    }, function() {
        console.log("showHtml main FAIL");
    });
*/

});