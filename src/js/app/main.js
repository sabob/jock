define(function(require) {
    var $ = require("jquery");
    require("app/setup");
    var Intro = require("./views/intro/Intro");
    var Home = require("./views/home/Home");
    var Docs = require("./views/docs/Docs");
    var Why = require("./views/why/Why");
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

     $("#menu-why").click(function(e) {
        e.preventDefault();
        viewManager.showView({view: Why});
    });

    console.log("MAIN: ShowHTML footer");
    viewManager.showHTML({anim: false, html: footer, target: "#footer-holder"});

    var $footer = $("#footer");
    var $footerHint = $("#footer-hint");

    var footerHeight, footerHintHeight;
    setupFooterHeight();
    //$footer.css({position: "absolute"});
    //$footerHint.css({"": "absolute"});
    var speed = "fast";
    var busyAnimating = false;
    $("#footer-hint, #footer-content").on("mouseenter", mouseEnterFooterHint);
    $("#footer-hint, #footer-content").on("mouseleave", mouseLeaveFooterHint);

    function mouseEnterFooterHint(e) {
        var that = this;
        setTimeout(function() {
            if (busyAnimating) {
                busyAnimating = false;
                return;
            }

            $("#footer-hint").addClass("active");

            var $toc = $("#toc");
            $footer.stop();
            $toc.stop();
            tocBottom = footerHeight - footerHintHeight;
            if (overlapTocAndFooterHint()) {
                var tocBottom = footerHeight;
            }
            $footer.animate({height: footerHeight}, speed);
            $toc.animate({bottom: tocBottom}, speed);

        }, 0);
    }

    function mouseLeaveFooterHint(e) {
        var that = this;
        setTimeout(function() {
            if ($('#footer-content:hover').length > 0) {
                busyAnimating = true;
                return;
            }
            if ($('#footer-hint:hover').length === 0) {
                $("#footer-hint").removeClass("active");
            }

            var $toc = $("#toc");
            $footer.stop();
            $toc.stop();


            var tocBottom = 0;
            if (overlapTocAndFooterHint()) {
                tocBottom = footerHintHeight;
            }

            $footer.animate({height: footerHintHeight}, speed);
            $toc.animate({bottom: tocBottom}, speed);

        }, 0);
        /*
         
         if ($('#footer-content:hover').length > 0) {
         console.log("skip, hover:content true");
         return;
         }*/
    }

    function overlapTocAndFooterHint() {
        var $toc = $("#toc");
        if (!$toc.length) {
            return;
        }
        var $footerHint = $("#footer-hint");
        if (!$footerHint.length) {
            return;
        }
        var hintLeft = $footerHint.offset().left;
        var hintWidth = $footerHint.outerWidth();
        var hintRight = hintLeft + hintWidth;
        var tocLeft = $toc.position().left;
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
        footerHintHeight = $footerHint.height();
        $footer.css({
            visibility: "visible", height: footerHintHeight, position: "static"});
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