/**
 * 
 *
 * Based on: https://github.com/epeli/underscore.string/blob/master/lib/underscore.string.js
 */
define(function(require) {
    var $ = require("jquery");

    var nativeTrim = String.prototype.trim;
    var nativeTrimRight = String.prototype.trimRight;
    var nativeTrimLeft = String.prototype.trimLeft;


    var parseNumber = function(source) {
        return source * 1 || 0;
    };

    var defaultToWhiteSpace = function(characters) {
        if (characters == null)
            return '\\s';
        else if (characters.source)
            return characters.source;
        else
            return '[' + string.escapeRegExp(characters) + ']';
    };

    var string = {
        escapeRegExp: function(str) {
            if (str == null)
                return '';
            return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
        },
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
        trim: function(str, characters) {
            if (str == null)
                return '';
            if (!characters && nativeTrim)
                return nativeTrim.call(str);
            characters = defaultToWhiteSpace(characters);
            return String(str).replace(new RegExp('^' + characters + '+|' + characters + '+$', 'g'), '');
        },
        ltrim: function(str, characters) {
            if (str == null)
                return '';
            if (!characters && nativeTrimLeft)
                return nativeTrimLeft.call(str);
            characters = defaultToWhiteSpace(characters);
            return String(str).replace(new RegExp('^' + characters + '+'), '');
        },
        rtrim: function(str, characters) {
            if (str == null)
                return '';
            if (!characters && nativeTrimRight)
                return nativeTrimRight.call(str);
            characters = defaultToWhiteSpace(characters);
            return String(str).replace(new RegExp(characters + '+$'), '');
        },
        truncate: function(str, length, truncateStr) {
            if (str == null)
                return '';
            str = String(str);
            truncateStr = truncateStr || '...';
            length = ~~length;
            return str.length > length ? str.slice(0, length) + truncateStr : str;
        },
        /**
         * string.prune: a more elegant version of truncate
         * prune extra chars, never leaving a half-chopped word.
         * @author github.com/rwz
         */
        prune: function(str, length, pruneStr) {
            if (str == null)
                return '';
            str = String(str);
            length = ~~length;
            pruneStr = pruneStr != null ? String(pruneStr) : '...';
            if (str.length <= length)
                return str;
            var tmpl = function(c) {
                return c.toUpperCase() !== c.toLowerCase() ? 'A' : ' ';
            },
                    template = str.slice(0, length + 1).replace(/.(?=\W*\w*$)/g, tmpl); // 'Hello, world' -> 'HellAA AAAAA'

            if (template.slice(template.length - 2).match(/\w\w/))
                template = template.replace(/\s*\S+$/, '');
            else
                template = string.rtrim(template.slice(0, template.length - 1));
            return (template + pruneStr).length > str.length ? str : str.slice(0, template.length) + pruneStr;
        }
    };

    $.jock = $.jock || {};
    $.jock.string = string;
    return string;
});