//Better TOC? http://www.html5rocks.com/en/tutorials/es6/promises/#toc-api

define(function(require) {

    var $ = require("jquery");
    var template = require("hb!./Docs.htm");
    var domUtils = require("app/util/dom-utils");
    var viewManager = require("spamd/view/view-manager");
    var HelloWorldDemo = require("../demos/hello/HelloWorld");
    var te = require("spamd/template/template-engine");
    var API = require("../api/API");
    require("domReady!");
    function Docs() {

        var that = this;
        var scroll = null;

        this.onInit = function(container, options) {
            //console.log("Docs path", options.view.path);

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
            var html = te.render(template, context, toptions);
            container.attach(html, o);
            container.attached.then(onAttached);
            container.visible.then(onVisible);

            function onAttached() {
                /*
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
                */

                $(".content a.link").on("click", function(e) {
                    e.preventDefault();
                    var url = $.parseUrl(this.href);
                    var page = url.params.page;
                    var id = url.params.id;
                    viewManager.showView({view: page, animate: false, params: {id: id}});
                    //viewManager.showView({view: API, params: {id: "viewManager_showView"}});
                    console.log("1", location.href);
                    
                     //var temp = $.spamd.history.params.get("scroll");
                     //scroll = $(window).scrollTop();
                     //if (temp == scroll) {
                     //console.log("same scroll");
                     //return true;
                     //}
                     
                    console.log("STILL CHANGING");
                    //$.spamd.history.skipEventOnce(true);
                    //$.spamd.history.params.set("scroll", scroll);
                    //$.spamd.history.update({skipEvent: true});

                });

                //console.log("clicked called: scroll", scroll);
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
                console.log("Inside DOCS: visible", scroll);
                /*
                 if (!scroll) {
                 scroll = options.params.scroll;
                 }
                 */
                 if (scroll) {
                 $(window).scrollTop(scroll);
                 console.log("SCROLLing", scroll);
                 return;
                 }
                var id = options.params.id;
                if (id) {
                    scrollIntoView(id);
                }

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
    return new Docs();
});