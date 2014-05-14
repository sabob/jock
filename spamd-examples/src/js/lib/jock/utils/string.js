/**
 * 
 *
 * Based on: https://github.com/epeli/underscore.string/blob/master/lib/underscore.string.js
 */
define(function(require) {
    var $ = require("jquery");

    require("domReady!");

    var string = {
        capitalize: function(str) {
            str = str == null ? '' : String(str);
            return str.charAt(0).toUpperCase() + str.slice(1);
        },
        isCapitalized: function(str) {
            str = str == null ? '' : String(str);
            if (str.length === 0) {
                return false;
            }

            var first = str.charAt(0);
            return first.toUpperCase() === first;
        },
        isEmpty: function(str) {
            if (str == null) {
                return true;
            }
            return 0 === str.length;
        },
        isNotEmpty: function(str) {
            return !string.isEmpty(str);
        },
        isBlank: function(str) {
            if (str == null) {
                return true;
            }
            return 0 === $.trim(str).length;
        },
        isNotBlank: function(str) {
            return !string.isBlank(str);
        },
        startsWith: function(str, starts) {
            if (starts === '') {
                return true;
            }
            if (str == null || starts == null) {
                return false;
            }
            str = String(str);
            starts = String(starts);
            return str.length >= starts.length && str.slice(0, starts.length) === starts;
        },
        endsWith: function(str, ends) {
            if (ends === '') {
                return true;
            }
            if (str == null || ends == null) {
                return false;
            }
            str = String(str);
            ends = String(ends);
            return str.length >= ends.length && str.slice(str.length - ends.length) === ends;
        },
        toNumber: function(str, decimals) {
            if (!str) {
                return 0;
            }
            str = string.trim(str);
            if (!str.match(/^-?\d+(?:\.\d+)?$/)) {
                return NaN;
            }
            return parseNumber(parseNumber(str).toFixed(~~decimals));
        },
        trim: function(str) {
            return $.trim(str);
        }
    };

    var parseNumber = function(source) {
        return source * 1 || 0;
    };

    $.jock = $.jock || {};
    $.jock.string = string;

    return string;
});