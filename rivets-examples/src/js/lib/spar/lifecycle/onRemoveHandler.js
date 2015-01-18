define(function (require) {

	var $ = require("jquery");
	var utils = require("../utils/utils");

	function onRemoveHandler(options) {

		var deferred = $.Deferred();
		var promise = deferred.promise();

		if (typeof options.ctrl.onRemove !== 'function') {
			deferred.resolve();
			return promise;
		}

		var onRemoveOptions = {routeParams: options.routeParams, view: options.view};
		var booleanOrPromise = options.ctrl.onRemove(onRemoveOptions);

		if (booleanOrPromise == null || booleanOrPromise == true) {
			deferred.resolve();
			return promise;
		}

		if (booleanOrPromise == false) {
			deferred.reject();
			return promise;
		}

		if (utils.isPromise(booleanOrPromise)) {
			booleanOrPromise.then(function (bool) {

				// Request could have been overwritten by new request. Ensure this is still the active request
				if (!options.requestTracker.active) {
					deferred.reject();
					return promise;
				}

				if (bool == null || bool == true) {
					deferred.resolve();
				} else {
					deferred.reject();
				}
			}, function () {
				// onRemove promise rejected
				deferred.reject();

			});

		} else {
			console.warn("Ignorning new view since onRemove did not return a valid response. onRemove must return either true/false or a promise that resolves to true/false.");
			deferred.reject();
		}
		return promise;
	}

	return onRemoveHandler;
});