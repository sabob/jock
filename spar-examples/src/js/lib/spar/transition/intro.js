define(function (require) {

	var $ = require("jquery");
	var fade = require("./fade");

	function intro(options) {

		var deferred = $.Deferred();
		
		var transition = options.intro || fade.intro;

		transition(options, deferred.resolve);

		var promise = deferred.promise();
		return promise;
	}
	return intro;
});