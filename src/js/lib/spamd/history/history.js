define(function(require) {
    var $ = require("jquery");
    var hash = require("./hash");
    var params = require("./params");

    $.spamd = $.spamd || {};
    $.spamd.history = $.spamd.history || {};

    var createHistory = function() {

        var that = function(val) {
            if (that.disable()) {
                return;
            }
            return hash(val);
        };

        var skipOnce = false;
        var disable = false;

        that.skipOnce = function(val) {
            if (!arguments.length) {
                return skipOnce;
            } else {
                skipOnce = val;
            }
        };

        that.disable = function(val) {
            if (!arguments.length) {
                return disable;
            } else {
                disable = val;
            }
        };

        function hashHandler(newHash, initial) {
            if (that.disable()) {
                return;
            }
            if (that.skipOnce()) {
                that.skipOnce(false);
                return;
            }

            console.log('Hash "' + newHash + '"');
            if (initial)
                console.log('Hash is "' + newHash + '"');
            else
                console.log('Hash changed to "' + newHash + '"');
        }

        that.params = function(val) {
            if (arguments.length) {
                
            } else {
                
            }
        };
        
        that.params = {};

        that.params.add = function(params) {

        };

        that.params.remove = function(param) {

        };
        that.params.get = function(param) {

        };
        that.params.clear = function(param) {

        };

        hash.init(hashHandler);
        hash('x=1&y&x=1');
        var val = hash();
        var p = params(val);
        console.log("params", val, p.get(), p.string());
        
        //console.log("params", $.param(o, true));

        return that;
    };

    $.spamd.history = createHistory();
    return $.spamd.history;
});