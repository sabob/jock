define(function(require) {

    var $ = require("jquery");

    function globals() {

        var hashPrefix = '';

        var that = {};

        that.hashPrefix = function(val) {
            if (arguments.length === 1) {
                if (typeof val === 'string') {
                    hashPrefix = val;
                }
            } else {
                return hashPrefix;
            }
        };

        return that;
    }
    var globals = globals();
    return globals;
});