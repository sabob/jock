define(function(require) {
    var $ = require("jquery");
    var hash = require("./hash");
    var params = require("../utils/params");
    var paramsObj = null;

    $.jock = $.jock || {};
    $.jock.history = $.jock.history || {};

    var createHistory = function() {

        var that = {};
        var skipEventOnce = false;
        var disableOnce = false;
        var disable = false;
        var storedDisabledValue = null;
        var changeCallback;

        that.hash = function(val) {
            if (typeof val === 'undefined') {
                return hash();
            }

            if (that.disable()) {
                return;
            }

            return hash(val);
        };

        that.skipEventOnce = function(val) {
            if (typeof val === 'undefined') {
                return skipEventOnce;
            } else {
                skipEventOnce = val;
                return val;
            }
        };

        that.disableOnce = function(val) {
            if (typeof val === 'undefined') {
                return disableOnce;

            } else {
                disableOnce = val;
                if (storedDisabledValue == null) {
                    storedDisabledValue = disable;
                }

                if (val === true) {
                    disable = true;

                } else {
                    disable = storedDisabledValue;
                    storedDisabledValue = null;
                }
                return val;
            }
        };

        that.disable = function(val) {
            if (typeof val === 'undefined') {
                return disable;
            } else {
                disable = val;

                // update the stored value in case it is currently used
                storedDisabledValue = val;
                return val;
            }
        };

        function hashHandler(options) {
            if (that.disable()) {
                if (that.disableOnce()) {
                    that.disableOnce(false);
                    return;
                }
                return;
            }
            // update params from new hash
            // TODO test change
            paramsObj = params({params : options.newHash});

            if (that.skipEventOnce()) {
                that.skipEventOnce(false);
                return;
            }

            if (changeCallback) {
               options.hash = paramsObj;
               options.prevHash = params({params : options.oldHash});
               $(that).trigger("onHashChange", [options]);
                changeCallback(options);
            }
        }

        // TODO update shouldn't fire event by default
        that.update = function(options) {
            options = options || {};
            if (options.skipEvent === true) {
                that.skipEventOnce(true);
            }

            if (that.disable()) {
                if (that.disableOnce()) {
                    that.disableOnce(false);
                    return;
                }
                return;
            }
            if (paramsObj) {
                var str = paramsObj.toString();
                hash(str);
                paramsObj = null;
            }
        };

        that.trigger = function() {
            if (that.disable()) {
                return;
            }

            hash.trigger();
        };

        that.params = function(val) {
            if (typeof val === 'undefined' || typeof val === 'string') {
                ensureParamsInitialized();
                //return paramsObj.get(val);
                return paramsObj.get.apply(this, arguments);

            } else {
                if (that.disable()) {
                    return;
                }
                ensureParamsInitialized();
                //return paramsObj.set(val);
                return paramsObj.set.apply(this, arguments);
            }
        };

        that.params.get = function(param) {
            ensureParamsInitialized();

            if (typeof param === 'undefined') {
                return paramsObj.get();
            } else {
                return paramsObj.get(param);
            }
        };

        that.params.add = function(params) {
            if (that.disable()) {
                return;
            }

            ensureParamsInitialized();

            if (typeof params !== 'undefined') {
                paramsObj.add.apply(this, arguments);
            }
        };

        that.params.set = function(params) {
            if (that.disable()) {
                return;
            }

            ensureParamsInitialized();

            if (typeof params !== 'undefined') {
                paramsObj.set.apply(this, arguments);
            }
        };

        that.params.remove = function(params) {
            if (that.disable()) {
                return;
            }

            ensureParamsInitialized();

            if (typeof params !== 'undefined') {
                //paramsObj.remove(params);
                paramsObj.remove.apply(this, arguments);
            }
        };

        that.params.clear = function() {
            if (that.disable()) {
                return;
            }

            ensureParamsInitialized();
            paramsObj.clear();
        };

        that.clear = function() {
            // Synonymous to that.params.clear()
            that.params.clear();
        };

        that.init = function(callback) {
            changeCallback = callback;
            hash.init(hashHandler);
        };

        function ensureParamsInitialized() {
            if (paramsObj == null) {
                var hash = that.hash();
                paramsObj = params({params : hash});
            }
        }

        return that;
    };

    $.jock.history = createHistory();
    return $.jock.history;
});