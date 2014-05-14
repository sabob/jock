define(function(require) {
    var $ = require("jquery");
    var template = require("hb!./Home.htm");
    var titlePartial = require("hb!./title.htm");
    var Handlebars = require("handlebars");
    var te = require("jock/template/template-engine");
    var viewManager = require("jock/view/view-manager");
    require("domReady!");

    function Home() {

        // private variables
        var that = {};

        // priviledged methods

        that.onInit = function(container, args) {
            var jqXhr = $.ajax("data/person.json");

            container.overwrite.then(function(view) {

                console.error("Cancelled", view);
                jqXhr.abort();
            });

            var loginAware = function(promise) {
                var dfd = $.Deferred();
                promise.then(function(data) {
                    if (typeof data === 'string' && data.indexOf("<" === 0)) {
                        $.post("/login", {user: "test", password: "test"}).then(function(data) {
                            //console.log("LOGIN DONE", data);
                            dfd.resolve(arguments);
                        });
                        // handle login
                    } else {
                        dfd.resolve(arguments);
                    }
                    //console.log("DATA", data);
                    //console.log("ARGS", arguments);
                });
                return dfd.promise();
            };

            var promise = loginAware(jqXhr);

            promise.then(function(data) {

                console.log("YAY!", data);
                var url = $.jock.url("https://bob:pok@yahoo.com:8080/mydir1/mydir2/index.html?x=1&y=1#x=1&y=1", true);
                url.removeParam("y");
                url.addParam("m", null);
                Handlebars.registerPartial("titlePartial", titlePartial);
                //onReady();
                var context = {'name': 'Bob'};
                var options = {
                    bindtarget: "#container",
                    data: {
                        one: "two",
                        clk1: function(e) {
                            e.preventDefault();
                            console.log("clk1");
                        },
                        clk2: function(e) {
                            e.preventDefault();
                            console.log("clk2");
                        },
                        testAction: function(e, context, options) {
                            e.preventDefault();
                            //console.log("Hi Bob!" + Date.now());
                            console.log("context:", context, "options:", options);
                        }
                    }
                };
                var html = te.render(template, context, null, options);

                container.attach(html).then(function() {
                    onAttached(args);
                });
            });
        };

        that.onDestroy = function(viewOptions) {
            //console.error("Home onDestroy args.length", arguments.length);
        };

        // private methods
        function onAttached(args) {
            //testContains();
            //testClosest();
        }
        return that;
    }
    return Home;

});
