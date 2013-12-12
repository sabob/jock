/**
 * Based on: https://github.com/javve/hash.js/blob/master/hash.js
 * 
 * @param {type} require
 * @returns {undefined}
 */

define(function(require) {
    var $ = require("jquery");

    var createParams = function() {

        var params;

        var that = function(val) {
            params = parseParams(val);

            var result = {};

            result.get = function(param) {
                if (param) {
                    return params[param];
                } else {
                    return params;
                }
            };

            result.add = function(newParams) {
                for (var key in newParams) {

                    var val = newParams[key];
                    if ($.isArray(val)) {
                        for (var i = 0; i < val.length; i++) {
                            putParam(params, key, val[i]);
                        }
                    } else {
                        putParam(params, key, val);
                    }
                }
            };

            result.set = function(newParams) {
                for (var p in newParams) {
                    params[p] = newParams[p];
                }
            };

            result.remove = function(removeParams) {
                removeParams = (typeof (removeParams) == 'string') ? [removeParams] : removeParams;
                for (var i = 0; i < removeParams.length; i++) {
                    delete params[removeParams[i]];
                }
            };

            result.clear = function() {
                params = {};
            };

            result.toString = function() {
                var traditional = true;
                var str = $.param(params, traditional);
                return str;
            };

            result.toHash = function() {
                return "#" + result.toString();
            };

            return result;
        };

        var parseParams = function(val) {
            //var params = window.location.hash ? window.location.hash.substr(1).split("&") : [];
            var params = {};
            if (val == null) {
                return params;
            }
            if (val.charAt(0) === "#") {
                val = val.substr(1);
            }

            $.each(val.replace(/\+/g, ' ').split('&'), function(i, entry) {
                var param = entry.split('=');
                var key = decodeURIComponent(param[0]);
                var val = '';
                if (param.length === 2) {
                    val = decodeURIComponent(param[1]);
                }

                putParam(params, key, val);
            });

            return params;
        };

        function putParam(params, key, val) {

            if ($.isArray(params[key])) {
                // val is already an array, so push on the next value.
                params[key].push(val);

            } else if (params[key] !== undefined) {
                // val isn't an array, but since a second value has been specified,
                // convert val into an array.
                params[key] = [params[key], val];

            } else {
                params[key] = val;
            }
        }

        return that;
    };

    var params = createParams();
    return params;

//url("x").params({"a":"b"}).hparams.add().remove().hparams.set()params().addParam("a", "b").removeParam("x").setParam("x". "y").setHashParam("moo", "pok");
//var x = url("");

//moo();

});
