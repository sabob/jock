define(function (require) {

    var $ = require("jquery");

    function create(options) {

        var that = {};

        var ractiveFn = options.ractiveFn;

        var ractive = new ractiveFn({
            el: options.target,
            oncomplete: function () {
                console.log("oncomplete");
                this.transitionsEnabled = true;
            },
            onrender: function () {
                console.log("onrender");
            },
            onteardown: function () {
                console.log("onteardown");
            }
        });
        return ractive;
    }
    return create;
});