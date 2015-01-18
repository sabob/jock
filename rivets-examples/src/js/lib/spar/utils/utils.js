define(function (require) {

    var $ = require("jquery");

    function utils(options) {

        var that = {};

        that.isPromise = function (o) {
            if (o == null) {
                return false;
            }

            if (typeof o.then === 'function') {
                return true;
            }
            return false;
        }

        that.isRivetObject = function (o) {
            if ((typeof o == "object") && (o !== null)) {
                if (o.template != null ) {
                    return true;
                }
                return false;
            }
            return false;
        }


        return that;
    }

    var utils = utils();
    return utils;

});