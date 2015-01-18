define(function (require) {
    var $ = require("jquery");
    var Ractive = require("ractive");
    require('ractive-transitions-fade');
    //var Foo = require("rvc!./Foo");
    var template = require("hb!./Home.htm");
    var titlePartial = require("hb!./title.htm");
    //var Handlebars = require("Handlebars");
    var te = require("jock/template/template-engine");
    var viewManager = require("jock/view/view-manager");
    var Isotope = require("app/plugins/isotope/isotope.pkgd");
    require("domReady!");
    function Home() {
        //console.log("HANDLKE", Handlebars)

        // private variables
        var that = this;
        
        var myComp = null;

        // priviledged methods

        var items = [{val: 0}, {val: 1}];

        this.onInit = function (container, args) {
            console.log("IN");

            //console.log(fooComp);


            //Ractive.defaults.el = 'container';

            /*
             Ractive.defaults.construct = function() {
             console.log("DEFAULT construct");
             };
             
             Ractive.defaults.render = function() {
             console.log("DEFAULT render");
             };*/

            /*
             var fooComp = MyFoo2.extend({
             //el: 'container',
             onconstruct: function() {
             //this._super();
             console.log("onconstruct")
             this.on("construct", function() {
             console.log("onconstruct2")
             });
             this.on("init", function() {
             console.log("oninit")
             });
             },
             moo2:1,
             onrender: function() {
             console.log("onrender")
             //this._super();
             }
             });*/

            /*
             fooComp.on('construct', function () {
             console.log("LIFE construct");
             });
             
             fooComp.on('init', function () {
             console.log("LIFE init");
             });
             
             fooComp.on('render', function () {
             console.log("LIFE render");
             //alert("ohb")
             });
             
             fooComp.on('config', function () {
             console.log("LIFE config");
             });
             
             fooComp.on('insert', function () {
             console.log("LIFE insert");
             });
             
             fooComp.on('complete', function () {
             console.log("LIFE complete");
             });
             
             fooComp.on('teardown', function () {
             console.log("LIFE Teardown");
             });*/

            /*
             var ractive = new Ractive({
             // The `el` option can be a node, an ID, or a CSS selector.
             el: 'container',
             // We could pass in a string, but for the sake of convenience
             // we're passing the ID of the <script> tag above.
             template: '<h1>Hello {{name}}</h1>',
             //template: Foo,
             // Here, we're passing in some initial data
             data: {name: 'world'}
             });
             */

            //fooComp.render("container");
            //fooComp.insert("container");

            //fooComp.set("name", "moo");
            container.attach(MyFoo2);
            container.attached.then(onAttached);


            //console.log("FOO", fooComp);
            /*
             container.complete().then(function () {
             console.log("COMPLETE");
             });*/
            //container.cancel();
        };

        // Commented to shows how on Destroy could be used to cancel showing a new view
        this.onDestroy = function (options) {
            console.log("onDestroy");
            /*
             var p = fooComp.teardown();
             //var node = fooComp.detach();
             //fooComp.insert("container");
             //console.log("P", p)
             p.then(function () {
             console.log("teardown complete");
             fooComp = new Foo({
             //el:  document.createDocumentFragment(),
             //el: 'container',
             data: {
             name: 'world',
             items: items
             },
             moo: function (arg) {
             console.log(arg);
             this.push("items", {val: 3});
             }
             });
             console.log("Comp", fooComp);
             var p = fooComp.render('container');
             //var p = fooComp.insert('container');
             //p.then(function() {
             //fooComp.insert('component');
             //console.log("P", p)
             
             //});
             });
             // Returning false means we cancel that showView call and stay on this view.
             //var continueProcessing = confirm("Cancel changes?")
             //return continueProcessing;
             return false;
             */

        };

        function onAttached(options) {
            console.log("HOME attached arg", options);
            console.log("ractive", options.ractive);

            // TODO use home template before coninuing
            return;

            $("#radios").radiosToSlider();
            var iso = new Isotope('#isotope', {
                layoutMode: 'masonry',
                transitionDuration: '1s'
                        //  layoutMode: 'fitRows'
                        //layoutMode: 'fitColumns'
            });
            $('#radios').click(function (e) {
                //if($('').is(':checked')) { alert("it's checked"); }
                var $target = $(e.target);
                //console.log($target.attr("id"));
                var value = $target.data("radio");
                //var value  = $target.attr("id");
                if (value == null) {
                    return; // Didn't click on a radio
                }

                // Turn value into a CSS selector
                if (value === 'fast') {
                    value = '*';
                } else {
                    value = '.' + value;
                }
                console.log(value)

                iso.arrange({
                    filter: value
                });
            });
            $("#down").on('click', function (e) {
                e.preventDefault();
                window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
                downloadWithXHR2();
            });
        }

        function downloadWithXHR2() {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "test.pdf");
            xhr.responseType = "arraybuffer";
            xhr.onload = function () {
                if (this.status === 200) {
                    var blob = new Blob([xhr.response], {type: "application/pdf"});
                    var objectUrl = URL.createObjectURL(blob);
                    //window.location.assign(objectUrl);
                    $("<a id='download' href='" + objectUrl + "' download='test.pdf' style='display:none'></a>").appendTo("body");
                    $("#download")[0].click();
                    $("#download").remove();
                    //console.log("VAL", objectUrl);
                    //window.open(objectUrl);
                }
            };
            xhr.send();
        }
    }
    return Home;
});
