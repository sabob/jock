define(function(require) {
    var $ = require("jquery");
    require("app/setup");
    var Home = require("./views/home/Home");
    var CustomerSearch = require("./views/customer/CustomerSearch");
    var ProductSearch = require("./views/product/ProductSearch");
    var CalendarEdit = require("./views/calendar/CalendarEdit");
    var footer = require("hb!./views/footer/footer.htm");
    var viewManager = require("jock/view/view-manager");
    /*
    $("#menu-home").click(function(e) {
        e.preventDefault();
        //viewManager.showView({view: Home});
        //var link = e.target;
        //setActiveMenu(link);

    });*/

    $("#menu-customers").click(function(e) {
        e.preventDefault();
        viewManager.showView({view: CustomerSearch, animate: true});
    });


    $("#menu-products").click(function(e) {
        e.preventDefault();
        viewManager.showView({view: ProductSearch});
    });
    
    $("#menu-calendar").click(function(e) {
        e.preventDefault();
        viewManager.showView({view: CalendarEdit});
    });

/*
    viewManager.showHTML({animate: false, html: footer, target: "#footer-holder"}).then(function() {
        var $footer = $("#footer");
        var $footerHint = $("#footer-hint");

        var footerHeight, footerHintHeight;
        setupFooterHeight();
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
    });*/
    
});