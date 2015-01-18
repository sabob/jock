define(function (require) {
    var $ = require("jquery");
    //require("jquery.address");
    var utils = require("../utils/utils");
    var Handlebars = require("handlebars");
    var moment = require("moment");
    var numeral = require("numeral");

    function TemplateEngine() {

        var registered = false;

        var actionRegistryLength = 0;
        var actionRegistry = {};

        this.hasActions = function () {
            return actionRegistryLength > 0;
        };

        this.reset = function () {
            actionRegistry = {};
            actionRegistryLength = 0;
        };

        this.render = function (options) {

            var template = options.template;
            var context = options.context;
            var actions = options.actions;
            var data = options.data;
            var helpers = options.helpers;
            var partials = options.partials;

            var hbOptions = {data: {}};
            actions = actions || {};

            if (data == null) {
                if (actions != null) {
                    hbOptions.data = actions;
                }
            } else {
                $.extend(hbOptions.data, data);
                if (actions != null) {
                    $.extend(hbOptions.data, actions);
                }
            }

            if (helpers != null) {
                hbOptions.helpers = helpers;
            }

            if (partials != null) {
                hbOptions.partials = partials;
            }

            var html = template(context, hbOptions);

            return html;
        };

        this.bind = function (target) {
            if (!this.hasActions()) {
                return;
            }
            target = target || "body";
            //console.log("binding target:", target);

            // Select target with data-jock-attribute and all children with data-jock-attribute
            $("[data-jock-action]", target).addBack("[data-jock-action]").each(function (i, item) {
                var currentID = this.attributes["data-jock-action"].value;

                var actionArray = actionRegistry[currentID];
                delete actionRegistry[currentID];
                actionRegistryLength--;

                var $node = $(this);

                for (var i = 0; i < actionArray.length; i++) {
                    var currentAction = actionArray[i];

                    if (currentAction.action == null) {
                        continue;
                    }
                    bindAction(currentAction, $node);
                }

                // remove the action attribute
                $node.removeAttr("data-jock-action");
            });
        };

        function bindAction(action, $node) {
            $node.on(action.on, function (e) {
                if (action.on === "click") {
                    //e.preventDefault();
                }

                // Bind jQuery this to action
                action.action.call(this, e, action.objectRef, action.options);
            });

        }

        this.registerHelpers = function () {
            if (registered) {
                return;
            }
            registered = true;

            checkHelper('action');
            Handlebars.registerHelper('action', function (options) {
                if (options == null || options.hash == null) {
                    return;
                }

                var actionArray = [];
                var context = this;

                $.each(options.hash, function (key, value) {
                    if ($.isFunction(value)) {

                        var actionData = {
                            on: key,
                            action: value,
                            options: options,
                            objectRef: context
                        };
                        actionArray.push(actionData);
                    }
                });

                actionRegistry[actionRegistryLength] = actionArray;
                actionRegistryLength++;
                var id = actionRegistryLength - 1;

                return new Handlebars.SafeString("data-jock-action=\"" + id + "\"");
            });

            checkHelper('formatDate');
            Handlebars.registerHelper('formatDate', function (context, block) {

                var f = block.hash.format || "MMM Do, YYYY";
                var day = moment(context);
                return day.format(f);
            });

            checkHelper('formatNumber');
            Handlebars.registerHelper('formatNumber', function (context, block) {
                var f = block.hash.format || "#";
                var str = numeral(context).format(f);
                return str;
            });

            var ExpressionRegistry = function () {
                this.expressions = [];
            };

            ExpressionRegistry.prototype.add = function (operator, method) {
                this.expressions[operator] = method;
            };

            ExpressionRegistry.prototype.call = function (operator, left, right) {
                if (!this.expressions.hasOwnProperty(operator)) {
                    throw new Error('Unknown operator "' + operator + '"');
                }

                return this.expressions[operator](left, right);
            };

            var eR = new ExpressionRegistry;
            eR.add('==', function (left, right) {
                return left == right;
            });
            eR.add('not', function (left, right) {
                return left != right;
            });
            eR.add('>', function (left, right) {
                return left > right;
            });
            eR.add('<', function (left, right) {
                return left < right;
            });
            eR.add('>=', function (left, right) {
                return left >= right;
            });
            eR.add('<=', function (left, right) {
                return left <= right;
            });
            eR.add('===', function (left, right) {
                return left === right;
            });
            eR.add('!==', function (left, right) {
                return left !== right;
            });
            eR.add('in', function (left, right) {
                if (!isArray(right)) {
                    right = right.split(',');
                }
                return right.indexOf(left) !== -1;
            });

            var isHelper = function () {
                var args = arguments
                        , left = args[0]
                        , operator = args[1]
                        , right = args[2]
                        , options = args[3]
                        ;

                if (args.length == 2) {
                    options = args[1];
                    if (left)
                        return options.fn(this);
                    return options.inverse(this);
                }

                if (args.length == 3) {
                    right = args[1];
                    options = args[2];
                    if (left == right)
                        return options.fn(this);
                    return options.inverse(this);
                }

                if (eR.call(operator, left, right)) {
                    return options.fn(this);
                }
                return options.inverse(this);
            };

            checkHelper('is');
            Handlebars.registerHelper('is', isHelper);

            function checkHelper(name) {
                if (name in Handlebars.helpers) {
                    throw new Error('Helper, "' + name + '" is already registered as a Handlebars helper!');
                }
            }

        };
    }

    var engine = new TemplateEngine();
    engine.registerHelpers();

    return engine;
});