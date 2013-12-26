define(function(require) {

    var template = require("hb!./HelloWorld.htm");

    function HelloWorld() {

        this.onInit = function(container, options) {
            container.attach(template);
        };
    }
    return HelloWorld;
});