define(function(require) {

    var $ = require("jquery");
    var template = require("hb!./API.htm");
    var viewManager = require("spamd/view/view-manager");
    require("domReady!");

    function Intro() {

        var that = this;

        this.getTemplate = function() {
            return template;
        };

        this.onInit = function(dom, options) {
            //console.log("API.onInit", options);
            //viewManager.hash.disabled(true);
            //console.log("Hash Disabled true");

            var animValue = !options.hashChange;
            console.log("Will anim", options);
            dom.attach(this.getTemplate(), {anim: animValue});
            dom.attached.then(onAttached);
            dom.visible.then(onVisible);

            function onAttached() {
                console.log("POS", $(".toc").position());

                $(".toc a").on("click", function(e) {
                    //console.log("url", $.parseUrl(this.href));
                    var url = $.parseUrl(this.href);
                    console.log("id", url.params.id);
                    //console.log("T", target);
                    //e.preventDefault();
                    viewManager.hash.skipOnce(true);
                    //viewManager.setProcessHashChange(false);
                    //$.address.value("");
                    //$.address.path(url.hash);
                    var id = url.params.id;
                    //$.address.parameter("id", id);
                    //viewManager.setProcessHashChange(true);
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
                $(window).scrollTop(top);
            }
        };

        this.onDestroy = function() {
            //console.log("Hash Disabled false");
            //viewManager.hash.disable(false);
        };
    }
    return Intro;
});