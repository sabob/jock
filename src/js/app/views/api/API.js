//Better TOC? http://www.html5rocks.com/en/tutorials/es6/promises/#toc-api

define(function(require) {

    var $ = require("jquery");
    var template = require("hb!./API.htm");
    var domUtils = require("app/util/dom-utils");
    var viewManager = require("spamd/view/view-manager");
    require("domReady!");
    function API() {

        var that = {};

        that.onInit = function(container, options) {
            console.log("API path", options.view.path);

            var animValue = !options.hashChange;
            var containerOptions = {};
            if (animValue === false) {
                containerOptions.animate = animValue;
            };

            container.attach(template, containerOptions);
            container.attached.then(onAttached);
            container.visible.then(onVisible);

            function onAttached() {
                
                /*try {
                    throw new Error("hello");
                } catch (e) {
                    alert($.spamd.extractStacktrace(e));
                }*/

                var windowUrl = $.spamd.url().removeHashParam("id").toString();

                $(".toc a, a.self").each(function(i, elem) {
                    var href = $(this).attr("href");
                    if (href) {
                        href = windowUrl + "&" + href;
                    } else {
                        href = windowUrl;
                    }

                    $(this).attr("href", href);
                });
                $(".toc a, a.self").on("click", function(e) {
                    var url = $.parseUrl(this.href);
                    //$.spamd.history.skipEventOnce(true);
                    var id = url.params.id;
                    scrollIntoView(id);
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
        
        that.onDestroy = function(viewOptions) {
            console.log("API onDestroy args.length", arguments.length);
        };
        return that;
    }
    return API;
});