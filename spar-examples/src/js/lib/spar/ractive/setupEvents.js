define(function (require) {

    var $ = require("jquery");

    function setupEvents(options) {
        //console.error(Ractive.defaults);
        Ractive.defaults.onrender = function () {
            //console.error("OK", this.el);
        };


        // Add callback events
        options.view.off('complete');
        options.view.off('render');
        options.view.off('teardown');
        options.view.on('complete', function () {
            this.transitionsEnabled = true;
            //console.log("oncomplete");
            options.ctrl.onComplete(options);
            options.spar.triggerEvent("complete", options.ctrl, options);
        });

        options.view.on('render', function () {
            //console.log("onrender");
            options.ctrl.onRender(options);
            options.spar.triggerEvent("render", options.ctrl, options);
        });

        options.view.on('teardown', function () {
            //console.log("onteardown");
            options.spar.triggerEvent("teardown", options.ctrl, options);
        });

        var that = {};



        return that;
    }
    return setupEvents;
});