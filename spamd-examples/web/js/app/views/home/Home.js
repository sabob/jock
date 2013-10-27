define(function(require) {
    //var module = require("module");
    var $ = require("jquery");
    var template = require("text!./Home.htm");
    var ClientSearch = require("../client/ClientSearch");
    var utils = require("spamd/utils/utils");
    var viewManager = require("spamd/view/view-manager");
    require("domReady!");

    function Home() {

        // private variables
        var that = this;

        // priviledged methods

        this.onInit = function(dom, options) {
            //onReady();
            dom.attach(template).then(function() {
                onAttached(options);
            });
        };

        // private methods
        function onAttached(options) {
            $("#manageClients").click(function(evt) {
                viewManager.showView({view: ClientSearch});
            });

            $("#manageProducts").click(function(evt) {
            });

            $("#manageServices").click(function(evt) {
            });

            $("#manageOpportunities").click(function(evt) {
            });
        }
    }
    
    //Home.id = module.id;

    return Home;

});
