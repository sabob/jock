define(function (require) {

    var $ = require("jquery");
    var utils = require("../utils/utils");

    function onInitHandler(options) {

        var deferred = $.Deferred();
        var promise = deferred.promise();

        var onInitOptions = {routeParams: options.routeParams};
        var rivetTemplateOrPromise = options.ctrl.onInit(onInitOptions);

        if (rivetTemplateOrPromise == null) {
            console.warn("Ignorning view since onInit returned null. onInit must return either a Rive template or a promise that resolves to a Rivet object.");
            deferred.reject();
            return promise;
        }

        if (utils.isPromise(rivetTemplateOrPromise)) {
            rivetTemplateOrPromise.then(function (rivetObj) {
			
				if (typeof rivetObj === 'function') {
					rivetObj = new rivetObj();
				}

                // Request could have been overwritten by new request. Ensure this is still the active request
                if (!options.requestTracker.active) {
                    deferred.reject();
                    return promise;
                }

                options.view = rivetObj;

                // Assume it is a Rivet object
                options.spar.processRivet(options).then(function (view) {
                    //console.log("1");
                    deferred.resolve(view);
                }, function () {
                    //console.log("2");
                    deferred.reject();
                });
            });

        } else if ($.isFunction(rivetTemplateOrPromise)) {
            // Assume it is a Rivet object
			options.view = new rivetTemplateOrPromise();
			options.spar.processRivet(options).then(function (view) {
                deferred.resolve(view);
            }, function () {
                deferred.reject();
            });

        } else if (utils.isRivetObject(rivetTemplateOrPromise)) {
            // Assume it is a Rivet instance
            options.template = rivetTemplateOrPromise.template;
			options.model = rivetTemplateOrPromise.model;
            options.spar.processRivet(options).then(function (view) {
                deferred.resolve(view);
            }, function () {
                deferred.reject();
            });

        } else {
            console.warn("Ignorning view since onInit did not return a valid response. onInit must return either a Rivet object or a promise that resolves to a Rivet object.");
            deferred.reject();
        }
        return promise;
    }

    return onInitHandler;
});