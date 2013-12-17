define(function(require) {

    var $ = require("jquery");
    var template = require("hb!./Docs.htm");
    var viewManager = require("spamd/view/view-manager");
    require("domReady!");
    function Intro() {

        var that = this;
        this.getTemplate = function() {
            return template;
        };
        this.onInit = function(dom, options) {
            console.log("API path", options.view.path);

            var animValue = !options.hashChange;

            dom.attach(this.getTemplate(), {anim: animValue});
            dom.attached.then(onAttached);
            dom.visible.then(onVisible);

            function onAttached() {

                var windowUrl = $.spamd.url().removeHashParam("id");

                $(".toc a").each(function(i, elem) {
                    var href = $(this).attr("href");

                    $(this).attr("href", windowUrl + "&" + href);
                });
                $(".toc a").on("click", function(e) {
                    var url = $.parseUrl(this.href);
                    $.spamd.history.skipOnce(true);
                    var id = url.params.id;
                    scrollIntoView(id);
                });
            }

            function onVisible() {
                console.log("POS2", $(".toc").position());
                var id = options.params.id;
                console.log("ID", id);
                scrollIntoView(id);
            }

            function scrollIntoView(id) {
                var top = 0;
                if (id) {
                    top = $("#" + id).offset().top;
                }
                console.log("ID", id);
                $(window).scrollTop(top);
            }
        };
    }
    return Intro;
});