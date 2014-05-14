define(function(require) {

    var $ = require("jquery");

    function utils() {

        var that = {};

        that.pluralize = function(count, word) {
            return count === 1 ? word : word + 's';
        };

        return that;
    }

    return utils();

});