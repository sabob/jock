/**
 * Inspired by : https://github.com/derek-watson/jsUri
 */
define(function(require) {

    var $ = require("jquery");
    var string = require("./string");
    var createParams = require("./params");

    function createUrl(url, strictMode) {
        var url = new Url(url, strictMode);
        return url;
    }

    function Url(url, strictMode) {
        if (typeof url === 'boolean') {
            strictMode = url;
            url = window.location.href;
        } else {
            url = url || window.location.href;  
        }

        this.uri = parseUri(url, strictMode);

        this.params = null;

        this.hashParams = null;

        this.hasAuthorityPrefixUserPref = null;
    }
    Url.prototype.protocol = function(val) {
        if (typeof val === 'undefined') {
            return this.uri.protocol;
        } else {
            this.uri.protocol = val;
            return this;
        }
    };

    Url.prototype.userInfo = function(val) {
        if (typeof val === 'undefined') {
            return this.uri.userInfo;
        } else {
            this.uri.userInfo = val;
            return this;
        }
    };

    Url.prototype.user = function(val) {
        if (typeof val === 'undefined') {
            return this.uri.user;
        } else {
            this.uri.user = val;
            return this;
        }
    };

    Url.prototype.password = function(val) {
        if (typeof val === 'undefined') {
            return this.uri.password;
        } else {
            this.uri.password = val;
            return this;
        }
    };

    Url.prototype.host = function(val) {
        if (typeof val === 'undefined') {
            return this.uri.host;
        } else {
            this.uri.host = val;
            return this;
        }
    };

    Url.prototype.port = function(val) {
        if (typeof val === 'undefined') {
            return this.uri.port;
        } else {
            this.uri.port = val;
            return this;
        }
    };

    Url.prototype.path = function(val) {
        if (typeof val === 'undefined') {
            return this.uri.path;
        } else {
            this.uri.path = val;
            return this;
        }
    };

    Url.prototype.path = function(val) {
        if (typeof val === 'undefined') {
            return this.uri.path;
        } else {
            this.uri.path = val;
            return this;
        }
    };

    Url.prototype.query = function(val) {
        if (typeof val === 'undefined') {
            return this.uri.query;
        } else {
            this.uri.query = val;

            //reset params in order to be parsed again
            this.params = null;
            return this;
        }
    };


    Url.prototype.anchor = function(val) {
        return this.hash(val);
    };

    Url.prototype.hash = function(val) {
        if (typeof val === 'undefined') {
            return this.uri.anchor;
        } else {
            this.uri.anchor = val;
            
            //reset hashParams in order to be parsed again
            this.hashParams = null;
            return this;
        }
    };

    Url.prototype.param = function(val) {
        if (typeof val === 'undefined' || typeof val === 'string') {
            return this.getParam(val);
        } else {
            this.setParam(val);
            return this;
        }
    };

    Url.prototype.setParam = function(val) {
        this.ensureParamsInitialized();
        this.params.set.apply(this, arguments);
        return this;
    };

    Url.prototype.getParam = function(val) {
        this.ensureParamsInitialized();
        if (typeof val === 'undefined') {
            return this.params.get();
        } else {

            var param = this.params.get(val);

            if ($.isArray(param)) {
                if (param.length === 0) {
                    return null;
                } else {
                    return param[0];
                }
            }
            return param;
        }
    };

    Url.prototype.getParams = function(val) {
        this.ensureParamsInitialized();
        if (typeof val === 'undefined') {
            return this.params.get();
        } else {
            return this.params.get(val);
        }
    };

    Url.prototype.addParam = function(val) {
        this.ensureParamsInitialized();
        this.params.add.apply(this, arguments);
        return this;
    };

    Url.prototype.removeParam = function(val) {
        this.ensureParamsInitialized();
        this.params.remove.apply(this, arguments);
        return this;
    };

    Url.prototype.ensureParamsInitialized = function() {
        if (this.params == null) {
            //var hash = that.hash();
            var val = this.uri.query;
            this.params = createParams({params : val});
        }
    };
    
    Url.prototype.hashParam = function(val) {
        if (typeof val === 'undefined' || typeof val === 'string') {
            return this.getHashParam(val);
        } else {
            this.setHashParam(val);
            return this;
        }
    };

    Url.prototype.setHashParam = function(val) {
        this.ensureHashParamsInitialized();
        this.hashParams.set.apply(this, arguments);
        return this;
    };

    Url.prototype.getHashParam = function(val) {
        this.ensureHashParamsInitialized();
        if (typeof val === 'undefined') {
            return this.hashParams.get();
        } else {

            var param = this.hashParams.get(val);

            if ($.isArray(param)) {
                if (param.length === 0) {
                    return null;
                } else {
                    return param[0];
                }
            }
            return param;
        }
    };

    Url.prototype.getHashParams = function(val) {
        this.ensureHashParamsInitialized();
        if (typeof val === 'undefined') {
            return this.hashParams.get();
        } else {
            return this.hashParams.get(val);
        }
    };

    Url.prototype.addHashParam = function(val) {
        this.ensureHashParamsInitialized();
        this.hashParams.add.apply(this, arguments);
        return this;
    };

    Url.prototype.removeHashParam = function(val) {
        this.ensureHashParamsInitialized();
        this.hashParams.remove.apply(this, arguments);
        return this;
    };

    Url.prototype.ensureHashParamsInitialized = function() {
        if (this.hashParams == null) {
            var val = this.uri.anchor;
            this.hashParams = createParams({params : val});
        }
    };

    Url.prototype.toString = function() {

        var s = '';

        var protocol = this.protocol();
        var hasAuthorityPrefix = this.hasAuthorityPrefix();
        var userInfo = this.userInfo();
        var host = this.host();
        var port = this.port();
        var path = this.path();

        var query = this.query();
        // Params was set, so override query value
        if (this.params != null) {
            query = this.params.toString();
        }

        var hash = this.hash();
        // Hash Params was set, so override hash value
        if (this.hashParams != null) {
            hash = this.hashParams.toString();
        }

        if (is(protocol)) {
            s += protocol;
            if (!string.endsWith(protocol, ":")) {
                s += ':';
            }
            s += '//';
        } else {
            if (hasAuthorityPrefix && is(host)) {
                s += '//';
            }
        }

        if (is(userInfo) && is(host)) {
            s += userInfo;
            if (!string.endsWith(userInfo, "@")) {
                s += '@';
            }
        }

        if (is(host)) {
            s += host;
            if (is(port)) {
                s += ':' + port;
            }
        }

        if (is(path)) {
            s += path;
        } else {
            if (is(host) && (is(query) || is(hash))) {
                s += '/';
            }
        }

        if (is(query)) {
            if (!string.startsWith(query, "?")) {
                s += '?';
            }
            s += query;
        }

        if (is(hash)) {
            if (!string.startsWith(hash, '#')) {
                s += '#';
            }
            s += hash;
        }

        return s;
    };

// hasAuthorityPrefix: if there is no protocol, the leading // can be enabled or disabled
    Url.prototype.hasAuthorityPrefix = function(val) {

        if (typeof val === 'undefined') {
            if (this.hasAuthorityPrefixUserPref === null) {
                return (this.uri.source.indexOf('//') !== -1);
            } else {
                return this.hasAuthorityPrefixUserPref;
            }

        } else {
            this.hasAuthorityPrefixUserPref = val;
            return this;
        }
    };

    function is(s) {
        return string.isNotEmpty(s);
    }

// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License
    function parseUri(str, strictMode) {
        var options = parseUri.options;
        if (typeof strictMode === 'undefined') {
            strictMode = true;
        }

        var m = options.parser[strictMode ? "strict" : "loose"].exec(str);
        var uri = {};
        var i = 14;

        while (i--) {
            uri[options.key[i]] = m[i] || "";
        }

        /*
         uri[options.query.name] = {};
         uri[options.key[12]].replace(options.query.parser, function($0, $1, $2) {
         if ($1) {
         uri[options.query.name][$1] = $2;
         }
         });
         */

        return uri;
    }

    parseUri.options = {
        key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
        query: {
            name: "queryKey",
            parser: /(?:^|&)([^&=]*)=?([^&]*)/g
        },
        parser: {
            strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
            loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        }
    };

    $.jock = $.jock || {};
    $.jock.url = createUrl;
    return $.jock.url;

});