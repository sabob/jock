/**
 * 
 * @param {type} domConstruct
 * @param {type} query
 * @param {type} parser
 * @param {type} dom
 * @param {type} on
 * @param {type} lang
 * @param {type} dojoString
 * @param {type} domForm
 * @param {type} JSON
 * @param {type} win
 * @param {type} easing
 * @param {type} registry
 * @param {type} array
 * @param {type} fx
 * @param {type} domAttr
 * @param {type} domStyle
 * @param {type} domGeom
 * @param {type} busyPanel
 * @param {type} utils
 * @param {type} viewManager
 * @param {type} validateWeb
 *
 *Based on http://parsleyjs.org/.
 */
define(["dojo/dom-construct",
    "dojo/query",
    "dojo/parser",
    "dojo/dom",
    "dojo/on",
    "dojo/_base/lang",
    "dojo/string",
    "dojo/dom-form",
    "dojo/json",
    "dojo/window",
    "dojo/fx/easing",
    "dijit/registry",
    "dojo/_base/array",
    "dojo/fx",
    "dojo/dom-attr",
    "dojo/dom-style",
    "dojo/dom-geometry",
    "app/components/busy/busyPanel",
    "./client-utils",
    "./view-manager",
    "dojox/validate/web",
    "dojox/validate/regexp",
    "dojo/NodeList-traverse",
    "dojo/domReady!"
],
        function(domConstruct,
                query,
                parser,
                dom,
                on,
                lang,
                dojoString,
                domForm,
                JSON,
                win,
                easing,
                registry,
                array,
                fx,
                domAttr,
                domStyle,
                domGeom,
                busyPanel,
                utils,
                viewManager,
                validateWeb,
                regexp
                ) {

            function ValidationUtils() {
            }

            var v = new ValidationUtils();
            ValidationUtils.prototype = {
                messages: {
                    defaultMessage: " seems to be invalid.",
                    type: {
                        email: " is not a valid email.",
                        url: " is not a valid url.",
                        urlstrict: " is not a valid url.",
                        number: " should be a valid number.",
                        digits: " should be digits.",
                        dateIso: " should be a valid date (YYYY-MM-DD).",
                        alphanum: " should be alphanumeric.",
                        phone: " should be a valid phone number."
                    },
                    notnull: " should not be null.",
                    notblank: " should not be blank.",
                    required: " is required.",
                    regexp: " seems to be invalid.",
                    min: " should be greater than or equal to %s.",
                    max: " should be lower than or equal to %s.",
                    range: " should be between %s and %s.",
                    minlength: " is too short. It should have %s characters or more.",
                    maxlength: " is too long. It should have %s characters or less.",
                    rangelength: " length is invalid. It should be between %s and %s characters long.",
                    mincheck: " should not have less than %s choices selected.",
                    maxcheck: " should not have more than %s choices selected.",
                    rangecheck: " should have between %s and %s choices selected.",
                    equalto: " should be the same."
                },
                constructor: ValidationUtils,
                required: function(options) {
                    options.validator = "required";
                    return this.validate(options);
                },
                regexp: function(options) {
                    options.validator = "regexp";
                    return this.validate(options);
                },
                min: function(options) {
                    options.validator = "min";
                    return this.validate(options);
                },
                max: function(options) {
                    options.validator = "max";
                    return this.validate(options);
                },
                type: function(options) {
                    options.validator = "type";
                    return this.validate(options);
                },
                range: function(options) {
                    options.validator = "range";
                    return this.validate(options);
                },
                minlength: function(options) {
                    options.validator = "minlength";
                    return this.validate(options);
                },
                maxlength: function(options) {
                    options.validator = "maxlength";
                    return this.validate(options);
                },
                rangelength: function(options) {
                    options.validator = "rangelength";
                    return this.validate(options);
                },
                mincheck: function(options) {
                    options.validator = "mincheck";
                    return this.validate(options);
                },
                maxcheck: function(options) {
                    options.validator = "maxcheck";
                    return this.validate(options);
                },
                rangecheck: function(options) {
                    options.validator = "rangecheck";
                    return this.validate(options);
                },
                equalto: function(options) {
                    options.validator = "equalto";
                    return this.validate(options);
                },
                validateEitherRequired: function(options) {
                    var val1 = options.value1 || null;
                    var val2 = options.value2 || null;
                    var label = options.label || null;
                    if (!label) {
                        throw new Error('options.label is required');
                    }
                    var errors = options.errors;
                    var focusId = options.focusId || null;

                    if (utils.isEmpty(val1) && utils.isEmpty(val2)) {
                        var error = {msg: label + " is required!", id: focusId};
                        errors.push(error);
                        return error;
                    }
                    return null;
                },
                validate: function(options) {
                    var msg = options.msg;
                    var val = options.value;
                    var name = options.name;
                    if (!name) {
                        throw new Error('options.name is required');
                    }
                    var id = options.focusId || name;
                    var errors = options.errors || [];
                    var constraints = options.constraints;
                    var validator = options.validator;
                    if (!validator) {
                        throw new Error('options.validator is required');
                    }
                    var isType = 'type' === validator;
                    var type = options.type;
                    if (isType) {
                        constraints = type;
                    }

                    var valid = this.validators[validator](val, constraints, this);
                    if (!valid) {
                        if (!msg) {
                            msg = this.messages[validator];
                            if (isType) {
                                msg = msg[type];
                            }
                        }
                        if (!msg) {
                            msg = this.messages.defaultMessage;
                        }
                        name = utils.formatLabel(name);
                        var message = this.formatMessage(msg, constraints);
                        var error = {msg: name + message, id: id};
                        errors.push(error);
                        return error;
                    }

                    return null;
                },
                validators: {
                    notnull: function(val) {
                        if (!val) {
                            return false;
                        }
                        return val.length > 0;
                    },
                    notblank: function(val) {
                        var isString = 'string' === typeof val;
                        if (isString) {
                            var trimmedStr = val.replace(/^\s+/g, '').replace(/\s+$/g, '');
                            if ('' !== trimmedStr) {
                                return true;
                            }
                        }
                        return false;
                    },
                    // Works on all inputs. val is object for checkboxes
                    required: function(val) {

                        // for checkboxes and select multiples. Check there is at least one required value
                        if ('object' === typeof val) {
                            for (var i in val) {
                                if (this.required(val[ i ])) {
                                    return true;
                                }
                            }

                            return false;
                        }

                        var notnull = this.notnull(val);
                        var notblank = this.notblank(val);
                        return notnull && notblank;
                    },
                    type: function(val, type) {
                        var regExp;
                        switch (type) {
                            case 'number':
                                regExp = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/;
                                break;
                            case 'digits':
                                regExp = /^\d+$/;
                                break;
                            case 'alphanum':
                                regExp = /^\w+$/;
                                break;
                            case 'email':
                                regExp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))){2,6}$/i;
                                break;
                            case 'url':
                                val = new RegExp('(https?|s?ftp|git)', 'i').test(val) ? val : 'http://' + val;
                                /* falls through */
                            case 'urlstrict':
                                regExp = /^(https?|s?ftp|git):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
                                break;
                            case 'dateIso':
                                regExp = /^(\d{4})\D?(0[1-9]|1[0-2])\D?([12]\d|0[1-9]|3[01])$/;
                                break;
                            case 'phone':
                                regExp = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,5})|(\(?\d{2,6}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/;
                                break;
                            default:
                                return false;
                        }

                        // test regExp if not null
                        return '' !== val ? regExp.test(val) : false;
                    },
                    regexp: function(val, regExp) {
                        return new RegExp(regExp).test(val);
                    },
                    minlength: function(val, min) {
                        return val.length >= min;
                    },
                    maxlength: function(val, max) {
                        return val.length <= max;
                    },
                    rangelength: function(val, arrayRange) {
                        return this.minlength(val, arrayRange[ 0 ]) && this.maxlength(val, arrayRange[ 1 ]);
                    },
                    min: function(val, min) {
                        return Number(val) >= min;
                    },
                    max: function(val, max) {
                        return Number(val) <= max;
                    },
                    range: function(val, arrayRange) {
                        return val >= arrayRange[ 0 ] && val <= arrayRange[ 1 ];
                    },
                    equalto: function(val, targetValue) {
                        //self.options.validateIfUnchanged = true;
                        return val === targetValue;
                    },
                    /**
                     * Aliases for checkboxes constraints
                     */
                    mincheck: function(obj, val) {
                        return this.minlength(obj, val);
                    },
                    maxcheck: function(obj, val) {
                        return this.maxlength(obj, val);
                    },
                    rangecheck: function(obj, arrayRange) {
                        return this.rangelength(obj, arrayRange);
                    }
                },
                formatMessage: function(message, args) {

                    if ('object' === typeof args) {
                        for (var i in args) {
                            message = this.formatMessage(message, args[ i ]);
                        }

                        return message;
                    }

                    return 'string' === typeof message ? message.replace(new RegExp('%s', 'i'), args) : '';
                }
            };
            return new ValidationUtils();
        });