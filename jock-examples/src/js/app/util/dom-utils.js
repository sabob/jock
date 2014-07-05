define(function(require) {
    var $ = require("jquery");

    var that = {};

    that.trackSidebarBottomPosition = function() {
        var $toc = $("#toc");
        if ($toc.length) {
            $window = $(window);
            $window.scroll(function(e) {
                var footerIndHeight = $("#footer-ind").height();
                var maxScrollHeight = $(document).height() - footerIndHeight;
                var scrollTop = $window.scrollTop();
                var windowHeight = $window.height();
                var bottom = scrollTop + windowHeight - maxScrollHeight;

                var switchBottom = bottom >= 0;
                if (switchBottom) {
                    $toc.css({
                        bottom: bottom
                    });
                } else {
                    $toc.css({
                        bottom: 0
                    });
                }
            });
        }
    };
    
    that.clearAlerts = function(msg) {
        var $feedback = $("#feedback");
        $feedback.empty();
    };

    that.alertSuccess = function(msg) {
        var $feedback = $("#feedback");

        if ($feedback.length === 0) {
            return;
        }

        $("#feedback").append("<div class='alert alert-success'>" + msg + "</div>");
    };

    return that;
});