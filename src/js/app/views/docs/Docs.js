//Better TOC? http://www.html5rocks.com/en/tutorials/es6/promises/#toc-api

define(function(require) {

    var $ = require("jquery");
    var template = require("hb!./Docs.htm");
    var domUtils = require("app/util/dom-utils");
    var viewManager = require("spamd/view/view-manager");
    var HelloWorldDemo = require("../demos/hello/HelloWorld");
    require("domReady!");
    function Intro() {

        var that = this;
        this.getTemplate = function() {
            return template;
        };
        this.onInit = function(dom, options) {
            console.log("Docs path", options.view.path);

            var animValue = !options.hashChange;
            
            var o = {anim: animValue};
            dom.attach(this.getTemplate(), o);
            dom.attached.then(onAttached);
            dom.visible.then(onVisible);

            function onAttached() {

                var windowUrl = $.spamd.url().removeHashParam("id").toString();

                $(".toc a").each(function(i, elem) {
                    var href = $(this).attr("href");
                    if (href) {
                        href = windowUrl + "&" + href;
                    } else {
                        href = windowUrl;
                    }

                    $(this).attr("href", href);
                });
                $(".toc a").on("click", function(e) {
                    var url = $.parseUrl(this.href);
                    $.spamd.history.skipEventOnce(true);
                    var id = url.params.id;
                    scrollIntoView(id);
                });
                
                $("#link-hello-world-demo").on("click", function(e) {
                    e.preventDefault();
                    //$.spamd.history.disable(true);
                    $.spamd.history.disableOnce(true);
                    viewManager.showView({view: HelloWorldDemo, target: "#hello-world-demo"});
                    //$.spamd.history.disable(false);
                });
            }

            function onVisible() {
                console.log("POS2", $(".toc").position());
                var id = options.params.id;
                scrollIntoView(id);

                //domUtils.trackSidebarBottomPosition();
            }

            function scrollIntoView(id) {
                var top = 0;
                if (id) {
                    var $el = top = $("#" + id);
                    if ($el.length) {
                        top = $el.offset().top;
                    }
                }
                $(window).scrollTop(top);
            }

           //$('#f').followTo(250);
        };
    }
    return Intro;
});