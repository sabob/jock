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
            container.attach(template);
        };
    }
    return Home;

});
