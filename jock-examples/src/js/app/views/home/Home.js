define(function (require) {
    var $ = require("jquery");
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

        // priviledged methods

        this.onInit = function (container, args) {

            container.attach(template).then(onAttached);
        };

        function onAttached(options) {
            console.log("arg", options);

            $("#radios").radiosToSlider();

            var iso = new Isotope('#isotope', {
                layoutMode: 'masonry',
                transitionDuration: '1s',
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

            $("#down").on('click', function () {
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
