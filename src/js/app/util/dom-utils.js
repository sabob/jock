define(function() {

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
    }

    return that;
});