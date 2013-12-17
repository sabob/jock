define(function(require) {
    var $ = require("jquery");
    require("app/setup");
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
    viewManager.showHTML({anim: false, html: footer, target: "#footer-holder"});

    var $footer = $("#footer");
    var $footerInd = $("#footer-ind");

    var footerHeight, footerIndHeight;
    setupFooterHeight();
    //$footer.css({position: "absolute"});
    //$footerInd.css({"": "absolute"});
    var speed = "fast";
    var busyAnimating = false;
    $("#footer-ind, #footer-content").on("mouseenter", function(e) {
        //console.log("enter" + $(this).attr("id"));
        //var that = this;
        setTimeout(function() {
            if (busyAnimating) {
                //console.log("SKIP")
                busyAnimating = false;
                return;
            }
            var $toc = $("#toc");
            $footer.stop();
            $toc.stop();
            tocBottom = footerHeight - footerIndHeight;
            if (overlapTocAndFooterHint()) {
                var tocBottom = footerHeight;
            }
            $footer.animate({height: footerHeight}, speed);
            $toc.animate({bottom: tocBottom}, speed);

        }, 0);
    });
    $("#footer-ind, #footer-content").on("mouseleave", function(e) {
        //console.log("leave" + $(this).attr("id"));
        var that = this;
        setTimeout(function() {
            if ($('#footer-content:hover').length > 0) {
                busyAnimating = true;
                //console.log("skip leave" + $(that).attr("id"));
                return;
            }

            //console.log("leave stopping" + $(that).attr("id"));
            var $toc = $("#toc");
            $footer.stop();
            $toc.stop();

            var tocBottom = 0;
            if (overlapTocAndFooterHint()) {
                tocBottom = footerIndHeight;
            }
            console.log("tocbottom", tocBottom);

            $footer.animate({height: footerIndHeight}, speed);
            $toc.animate({bottom: tocBottom}, speed);

        }, 0);
        /*
         
         if ($('#footer-content:hover').length > 0) {
         console.log("skip, hover:content true");
         return;
         }*/
    });

    function overlapTocAndFooterHint() {
        var $toc = $("#toc");
        if (!$toc.length) {
            return;
        }
        var $footerHint = $("#footer-ind");
        if (!$footerHint.length) {
            return;
        }
        var hintLeft = $footerHint.offset().left;
        var hintWidth = $footerHint.outerWidth();
        var hintRight = hintLeft + hintWidth;
        var tocLeft = $toc.position().left;
        console.log("right vs lef", hintRight < (tocLeft));
        if (hintRight > tocLeft) {
            return true;
        }
        return false;
    }

    function setupFooterHeight() {

        // Make footer visible and measure height and hide footer again
        $footer.css({
            visibility: "none", display: "block", position: "absolute"});
        footerHeight = $footer.height();
        footerIndHeight = $footerInd.height();
        $footer.css({
            visibility: "visible", height: footerIndHeight, position: "static"});
    }
    //});
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