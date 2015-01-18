define(function (require) {

    var $ = require("jquery");

    function setupEvents(options) {
        //console.error(Ractive.defaults);
        Ractive.defaults.onconstruct = function () {
            //console.error("OK", this);
        };

        // Add callback events
        options.view.off('complete');
        options.view.off('render');
		options.view.off('unrender');
        options.view.off('teardown');

        options.view.on('complete', function () {
            this.transitionsEnabled = true;
            //console.log("oncomplete");
			if (typeof options.ctrl.onComplete == 'function') {
				options.ctrl.onComplete(options);
			}
            options.spar.triggerEvent("complete", options.ctrl, options);
        });

        options.view.on('render', function () {
            //console.log("onrender");
			if (typeof options.ctrl.onRender == 'function') {
				options.ctrl.onRender(options);
			}
            options.spar.triggerEvent("render", options.ctrl, options);
        });
		
		options.view.on('unrender', function () {
            //console.error("unrender");
            options.spar.triggerEvent("unrender", options.ctrl, options);
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