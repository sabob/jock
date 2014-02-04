define(function(require) {
    var $ = require("jquery");
    //require("jquery.address");
    var utils = require("../utils/utils");
    var Handlebars = require("handlebars");
    var moment = require("moment");
    var numeral = require("numeral");
    require("domReady!");

    function TemplateEngine() {

        var registered = false;

        var actionRegistryLength = 0;
        var actionRegistry = {};

        this.hasActions = function() {
            return actionRegistryLength > 0;
        };

        this.reset = function() {
            actionRegistry = {};
            actionRegistryLength = 0;
        };

        this.render = function(template, context, actions, options) {
            options = options || {};
            options.data = options.data || {};
            actions = actions || {};
            $.extend(options.data, actions);
            
            var html = template(context, options);
            return html;
        };

        this.bind = function(target) {
            if (!this.hasActions()) {
                console.info("no actions to bind");
                return;
            }
            target = target || "body";
            //console.log("binding target:", target);

            // Select target with data-spamd-attribute and all children with data-spamd-attribute
            $("[data-spamd-action]", target).addBack("[data-spamd-action]").each(function(i, item) {
                var currentID = this.attributes["data-spamd-action"].value;

                var currentAction = actionRegistry[currentID];
                delete actionRegistry[currentID];
                actionRegistryLength--;
                if (currentAction.action == null) {
                    return true;
                }

                var node = $(this);
                node.on(currentAction.on, function(e) {
                    if (currentAction.on === "click") {
                        //e.preventDefault();
                    }

                    // Bind jQuery this to action
                    currentAction.action.call(this, e, currentAction.objectRef, currentAction.options);
                });
                // remove the action attribute
                node.removeAttr("data-spamd-action");
            });
        };

        this.registerHelpers = function() {
            if (registered) {
                return;
            }
            registered = true;

            checkHelper('action');
            Handlebars.registerHelper('action', function(action, options) {
                var on = options.hash.on || "click";

                var actionRef = action;
                if (typeof actionRef === "string") {
                    var target = options.data.target;
                    actionRef = target[action];
                    if (!utils.exist(actionRef)) {
                        actionRef = window[action];
                        if (utils.exist(actionRef)) {
                            console.log("The action name, '" + action + "', was found on the window object. It is not advisable to set actions globally!");
                        }
                    }
                }
                if (actionRef == null) {
                    console.warn("The action is '" + actionRef + "' for Action Helper: ", this);
                }

                var actionData = {
                    on: on,
                    action: actionRef,
                    options: options,
                    objectRef: this
                };

                actionRegistry[actionRegistryLength] = actionData;
                actionRegistryLength++;
                var id = actionRegistryLength - 1;

                return new Handlebars.SafeString("data-spamd-action=\"" + id + "\"");
            });

            checkHelper('formatDate');
            Handlebars.registerHelper('formatDate', function(context, block) {

                var f = block.hash.format || "MMM Do, YYYY";
                var day = moment(context);
                return day.format(f);
            });

            checkHelper('formatNumber');
            Handlebars.registerHelper('formatNumber', function(context, block) {
                var f = block.hash.format || "#";
                var str = numeral(context).format(f);
                return str;

            });

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