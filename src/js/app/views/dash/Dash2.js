define(function(require) {
    var $ = require("jquery");
    var template = require("hb!./Dash2.htm");
    var te = require("spamd/template/template-engine");
    var viewManager = require("spamd/view/view-manager");
    require("domReady!");

    function Home() {

        // private variables
        var that = this;

        // priviledged methods

        this.onInit = function(container, args) {
            container.attach(template).then(function() {
                onAttached(args);
            });
        };

        this.onDestroy = function(viewOptions) {
        };

        this.getTemplate = function() {
            return template;
        };

        // private methods
        function onAttached(args) {
            //testContains();
            //testClosest();
        }
    }

    return Home;

});
