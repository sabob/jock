define(function (require) {

	var $ = require("jquery");

	function setupDefaultEvents(options) {
		Ractive.defaults.onconstruct = function () {
			console.error("OK", this);
		};

		var that = {};

		return that;
	}
	return setupDefaultEvents;
});