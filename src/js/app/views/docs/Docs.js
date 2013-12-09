define(function(require) {

    var $ = require("jquery");
    var template = require("hb!./Docs.htm");
    require("domReady!");

    function Intro() {

        var that = this;

        this.getTemplate = function() {
            return template;
        };

        this.onInit = function(dom, args) {
            dom.attach(this.getTemplate()).then(function() {
                
            });
        };
    }
    return Intro;
});