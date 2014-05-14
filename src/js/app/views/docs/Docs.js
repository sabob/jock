//Better TOC? http://www.html5rocks.com/en/tutorials/es6/promises/#toc-api

define(function(require) {

    var $ = require("jquery");
    var template = require("hb!./Docs.htm");
    var domUtils = require("app/util/dom-utils");
    var viewManager = require("jock/view/view-manager");
    var HelloWorldDemo = require("../demos/hello/HelloWorld");
    var te = require("jock/template/template-engine");
    var API = require("../api/API");
    require("domReady!");
    function Docs() {

        var that = {};

        that.onInit = function(container, options) {
            //console.log("Docs path", options.view.path);
            $(options.hash).on("onHashChange", function() {
                console.log("change", arguments);
            });

            var animValue = !options.hashChange;

            var o = {animate: animValue};


            var context = {'name': 'Bob'};
            var toptions = {
                data: {
                    one: "two",
                    clk1: function(e) {
                        e.preventDefault();
                        console.log("clk1");
                    },
                    clk2: function(e) {
                        e.preventDefault();
                        console.log("clk2");
                    }
                }
            };
            var html = te.render(template, context, null, toptions);
            console.log("attach");
            container.attach(html, o);
            container.attached.then(onAttached);
            container.visible.then(onVisible);

            function onAttached() {
                /*
                var windowUrl = $.jock.url().removeHashParam("id").toString();

                $(".toc a").each(function(i, elem) {
                    var href = $(this).attr("href");
                    if (href) {
                        href = windowUrl + "&" + href;
                    } else {
                        href = windowUrl;
                    }

                    $(this).attr("href", href);
                });
                */

                $(".content a.link").on("click", function(e) {
                    e.preventDefault();
                    var url = $.parseUrl(this.href);
                    var page = url.params.page;
                    var id = url.params.id;
                    viewManager.showView({view: page, animate: false, params: {id: id}});
                });

                $(".toc a, .content a.self").on("click", function(e) {
                    var url = $.parseUrl(this.href);
                    $.jock.history.skipEventOnce(true);
                    var id = url.params.id;
                    scrollIntoView(id);
                });

                $("#link-hello-world-demo").on("click", function(e) {
                    e.preventDefault();
                    //$.jock.history.disable(true);
                    $.jock.history.disableOnce(true);
                    viewManager.showView({view: HelloWorldDemo, target: "#hello-world-demo"});
                    //$.jock.history.disable(false);
                });
            }

            function onVisible() {
                var id = options.params.id;
                if (id) {
                    scrollIntoView(id);
                }

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
        };
        
        return that;
    }
    return Docs;
});