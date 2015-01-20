define(function (require) {

	var $ = require("jquery");
	var fade = require("./fade");

	function outro(options) {

		var deferred = $.Deferred();
		
		var transition = options.outro || fade.outro;

		transition(options, deferred.resolve);

		var promise = deferred.promise();
		return promise;
	}
	return outro;
});