define(function(require) {
    var $ = require("jquery");
    require("domReady!");

    function Utils() {

        $.spamd = $.spamd || {};

        this.toJson = function(jqueryOrSelector, options) {
            var object = this.toObject(jqueryOrSelector, options);
            var json = JSON.stringify(object);
            return json;
        };

        this.fromJson = function(jqueryOrSelector, json, options) {
            var obj = JSON.parse(json);
            this.fromObject(jqueryOrSelector, obj, options);
            return json;
        };

        this.toObject = function(jqueryOrSelector, options) {
            options = options || {};

            var $form = jqueryOrSelector;
            var disabled;

            if (typeof jqueryOrSelector === "string") {
                $form = $(jqueryOrSelector);
            }

            if (options.includeDisabled === true) {
                // Find disabled inputs, and remove the "disabled" attribute
                disabled = $form.find(':input:disabled').removeAttr('disabled');
            }

            var result = {};
            var array = $form.serializeArray();
            $.each(array, function() {
                if (result[this.name]) {
                    if (!result[this.name].push) {
                        result[this.name] = [result[this.name]];
                    }
                    result[this.name].push(this.value || '');
                } else {
                    result[this.name] = this.value || '';
                }
            });

            if (options.includeDisabled === true) {
                // re-disabled the set of inputs that you previously enabled
                disabled.attr('disabled', 'disabled');
            }
            return result;
        };

        this.fromObject = function(jqueryOrSelector, obj, options) {
            options = options || {};
            var $form = jqueryOrSelector;
            var disabled;

            if (options.includeDisabled === true) {
                // Find disabled inputs, and remove the "disabled" attribute
                disabled = $form.find(':input:disabled').removeAttr('disabled');
            }

            if (typeof jqueryOrSelector === "string") {
                $form = $(jqueryOrSelector);
            }

            $form.deserialize(obj);

            if (options.includeDisabled === true) {
                // re-disabled the set of inputs that you previously enabled
                disabled.attr('disabled', 'disabled');
            }
        };

        this.exist = function(val) {
            if (typeof (val) === 'undefined' || val === null) {
                return false;
            }
            return true;
        };

        this.isEmpty = function(str) {
            if (!this.exist(str)) {
                return true;
            }

            return 0 === str.length;
        };

        this.isBlank = function(str) {
            if (!this.exist(str)) {
                return true;
            }

            return 0 === $.trim(str).length;
        };

        this.getFunctionName = function(view) {
            if (typeof view === 'string') {
                return view;
            }
            if (view.name) {
                return view.name;
            }
            var funcNameRegex = /function (.{1,})\(/;
            var results = (funcNameRegex).exec((view).constructor.toString());
            return (results && results.length > 1) ? results[1] : "";
        };
    }

    var utils = new Utils();
    $.spamd.toObject = utils.toObject;
    $.spamd.fromObject = utils.fromObject;
    $.spamd.toJson = utils.toJson;
    $.spamd.fromJson = utils.fromJson;

//TODO auto bind
// how to detect duplicate
    if ($.fn.toObject) {
        console.warn("There is already a jQuery plugin called 'toObject'. SPAMD won't override this plugin, instead use $.spamd.toObject");

    } else {
        $.fn.toObject = function(options) {
            return utils.toObject(this, options);

        };
    }

    if ($.fn.fromObject) {
        console.warn("There is already a jQuery plugin called 'fromObject'. SPAMD won't override this plugin, instead use $.spamd.fromObject");

    } else {
        $.fn.fromObject = function(obj, options) {
            utils.fromObject(this, obj, options);
            return this;
        };
    }

    if ($.fn.toJson) {
        console.warn("There is already a jQuery plugin called 'toJson'. SPAMD won't override this plugin, instead use $.spamd.toJson");

    } else {
        $.fn.toJson = function(options) {
            return utils.toJson(this, options);
        };
    }

    if ($.fn.fromJson) {
        console.warn("There is already a jQuery plugin called 'fromJson'. SPAMD won't override this plugin, instead use $.spamd.fromJson");

    } else {
        $.fn.fromJson = function(json, options) {
            utils.fromJson(this, json, options);
            return this;
        };
    }

    return utils;
});