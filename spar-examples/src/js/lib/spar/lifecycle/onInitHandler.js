define(function (require) {

    var $ = require("jquery");
    var utils = require("../utils/utils");

    function onInitHandler(options) {

        var deferred = $.Deferred();
        var promise = deferred.promise();

        var onInitOptions = {routeParams: options.routeParams};
        var RactiveFnOrPromise = options.ctrl.onInit(onInitOptions);

        if (RactiveFnOrPromise == null) {
            console.warn("Ignorning view since onInit returned null. onInit must return either a Ractive function or a promise that resolves to a Ractive function.");
            deferred.reject();
            return promise;
        }

        if (utils.isPromise(RactiveFnOrPromise)) {
            RactiveFnOrPromise.then(function (ractiveObj) {
			
				if (typeof ractiveObj === 'function') {
					ractiveObj = new ractiveObj();
				}

                // Request could have been overwritten by new request. Ensure this is still the active request
                if (!options.requestTracker.active) {
                    deferred.reject();
                    return promise;
                }

                options.view = ractiveObj;

                // Assume it is a Ractive object
                options.spar.processRactive(options).then(function (view) {
                    //console.log("1");
                    deferred.resolve(view);
                }, function () {
                    //console.log("2");
                    deferred.reject();
                });
            });

        } else if ($.isFunction(RactiveFnOrPromise)) {
            // Assume it is a Ractive function
            // Should this scenrio be supported? How will the view receive an instance to the ractive
            //options.spar.createRactive(RactiveFnOrPromise);
			options.view = new RactiveFnOrPromise();
			options.spar.processRactive(options).then(function (view) {
                deferred.resolve(view);
            }, function () {
                deferred.reject();
            });

        } else if (utils.isRactiveObject(RactiveFnOrPromise)) {
            // Assume it is a Ractive instance
            options.view = RactiveFnOrPromise;
            options.spar.processRactive(options).then(function (view) {
                deferred.resolve(view);
            }, function () {
                deferred.reject();
            });

        } else {
            console.warn("Ignorning view since onInit did not return a valid response. onInit must return either a Ractive function or a promise that resolves to a Ractive function.");
            deferred.reject();
        }
        return promise;
    }

    return onInitHandler;
});