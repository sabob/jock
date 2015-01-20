define(function (require) {

	var $ = require("jquery");
	var utils = require("../utils/utils");

	function onInitHandler(options) {

		var deferred = $.Deferred();
		var promise = deferred.promise();
		
		var ajaxTrackerWrapper = createAjaxTrackerAdaptor(options);

		var onInitOptions = {
			routeParams: options.routeParams,
			ajaxTracker: ajaxTrackerWrapper
		};

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
				
				deferred.resolve(options.view);
			});

		} else if ($.isFunction(RactiveFnOrPromise)) {
			// Assume it is a Ractive function
			// Should this scenrio be supported? How will the view receive an instance to the ractive
			//options.spar.createRactive(RactiveFnOrPromise);
			options.view = new RactiveFnOrPromise();
			deferred.resolve(options.view);

		} else if (utils.isRactiveObject(RactiveFnOrPromise)) {
			// Assume it is a Ractive instance
			options.view = RactiveFnOrPromise;
			deferred.resolve(options.view);

		} else {
			console.warn("Ignorning view since onInit did not return a valid response. onInit must return either a Ractive function or a promise that resolves to a Ractive function.");
			deferred.reject();
		}
		return promise;
	}

	function createAjaxTrackerAdaptor(options) {
		var adaptor = {
			add: function (jqXhr, args) {
				options.ajaxTracker.add(options.target, jqXhr, args);
			},
			remove: function (jqXhr, args) {
				options.ajaxTracker.remove(options.target, jqXhr);
			}
		};
		
		return adaptor;
	}

	return onInitHandler;
});