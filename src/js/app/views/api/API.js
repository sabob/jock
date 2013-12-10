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
                //var thref = location.href;
                //  $.address.parameter("id", null);
                //var lhref = location.href;
                //location.href = thref;

                //var uri = new $.spamd.Uri(location.href);
                //console.log(location.href);
                //console.log("parms", uri.query().params);

                $(".toc a").each(function(i, elem) {
                    var href = $(this).attr("href");
                    if (href) {
                        href = "&" + href;
                    }

                    //console.log("URI", uri);
                    var lhref = removeParameter(location.href, "id");
                    $(this).attr("href", lhref + href);
                });
                $(".toc a").on("click", function(e) {
                    //console.log("url", $.parseUrl(this.href));
                    var url = $.parseUrl(this.href);
                    viewManager.hash.skipOnce(true);
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
        this.onDestroy = function() {
            //console.log("Hash Disabled false");
            //viewManager.hash.disable(false);
        };

        function endsWith(str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        }

        function removeParameter(url, param) {
            var idx = url.indexOf(param + "=");
            if (idx == -1) {
                return url;
            }
            url = url.substr(0, idx);
            if (endsWith(url, "&")) {
                url = url.slice(0, -1);
            }
            return url;
        }
    }
    return Intro;
});