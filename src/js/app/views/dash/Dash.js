define(function(require) {
    var $ = require("jquery");
    var template = require("hb!./Dash.htm");
    var Dash1 = require("./Dash1");
    var Dash2 = require("./Dash2");
    var te = require("jock/template/template-engine");
    var viewManager = require("jock/view/view-manager");
    require("domReady!");

    function Dash() {

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

        // private methods
        function onAttached(args) {
            viewManager.showView({view: Dash2, target: "#dash2", params: {"1": "2"}, animate: false, updateHistory: false});
            viewManager.showView({view: Dash1, target: "#dash1", params: {"3": "4"}, animate: false, updateHistory: false});
            viewManager.updateHistory();
            //testContains();
            //testClosest();
        }
    }

    return Dash;

});
