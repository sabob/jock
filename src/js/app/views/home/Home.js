define(function(require) {
    var $ = require("jquery");
    var template = require("hb!./Home.htm");
    var titlePartial = require("hb!./title.htm");
    var Handlebars = require("handlebars");
    var te = require("spamd/template/template-engine");
    var viewManager = require("spamd/view/view-manager");
    require("domReady!");

    function Home() {

        // private variables
        var that = this;

        // priviledged methods

        this.onInit = function(container, args) {
            var url = $.spamd.url("https://bob:pok@yahoo.com:8080/mydir1/mydir2/index.html?x=1&y=1#x=1&y=1", true);
            //url.setParam("x");
            url.removeParam("y");
            url.addParam("m", null);
            console.log("URL", url.uri);
            console.log("Hash PARAMS", url.getHashParam("x"));
            console.log("MyURL", url.port(999).toString());
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
            var html = te.render(this.getTemplate(), context, options);

            container.attach(html).then(function() {
                /*
                 var t0 = performance.now();
                    te.bind("#footer");
                    var t1 = performance.now();
                    var total = (t1 - t0);
                    total = total.toFixed(2);
                    console.info("manual bind on 'a' took " + total);
                */
                //te.bind('a');
                //te.bind();
                onAttached(args);
            });
        };
        
        this.onDestroy = function(viewOptions) {
            //console.error("Home onDestroy args.length", arguments.length);
        };

        this.getTemplate = function() {
            return template;
        };

        // private methods
        function onAttached(args) {
            //testContains();
            //testClosest();
        }
        
        function testContains() {
            console.log("CONTAINS ------------- ");
            var child = $("#child")[0];
            var parent = $("#parent")[0];
            console.log("contains:", $.contains(parent, child));
        }
        
        function testClosest() {
            console.log("CLOSEST ------------- ");
            var child = $("#child")[0];
            var parent = $("#parent")[0];
            console.log("closest:", $("#child").closest("#container", $("#parent")[0]).length);
        }
    }



    return Home;

});
