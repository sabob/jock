define(function(require) {

    var $ = require("jquery");
    require("domReady!");
    require("spamd/history/history");
    var utils = require("../utils/utils");
    var templateEngine = require("../template/template-engine");
    function ViewManager() {

        var that = this;

        var currentView = {
            view: null,
            options: null
        };

        var settings = {
            defaultView: null,
            target: "#container",
            animate: true,
            animateHandler: null,
            attachHandler: null,
            onHashChange: $.noop,
            globalOnAttached: $.noop,
            bindTemplate: true
        };

        var processHashChange = true;

        var initialized = false;
        var routesByName = {};
        var routesByPath = {};
        var callStack = {};
        var errorHandlerStack = [];

        this.setRoutes = function(map) {
            if (map == null) {
                return;
            }

            routesByName = map;
            routesByPath = {};
            for (var prop in routesByName) {
                routesByPath[routesByName[prop]] = prop;
            }
        };

        this.getRoutesByPath = function() {
            return routesByPath;
        };
        this.init = function(options) {
            if (initialized) {
                // If no options are specified, and view-manager has been initialized before, we can skip initialization, otherwise
                // we continue and initialize ViewManager again.
                if (!options) {
                    return;
                }
            }

            initialized = true;
            settings.animateHandler = that.attachViewWithAnim;
            settings.attachHandler = that.attachView;

            settings = $.extend({}, settings, options);

            this.setRoutes(settings.routes);

            $.spamd.history.init(function(newHash, initial) {

                console.log("PROCESS HASH CHANGE OVER", processHashChange);

                if (processHashChange) {

                    processHashChange = false;

                    var viewName = $.spamd.history.params().page;
                    var viewPath = routesByName[viewName];
                    if (!viewPath) {
                        viewPath = viewName;
                    }

                    if (viewPath) {// ensure path is not blank
                        var params = $.spamd.history.params.get();
                        that.showView({view: viewPath, params: params, hashChange: true}).then(function(view) {
                            settings.onHashChange(view);
                            processHashChange = true;
                        });
                    }
                }
            });
            var hasPage = $.spamd.history.params().page;
            if (hasPage) {
                $.spamd.history.update();
            } else {

                if (settings.defaultView) {
                    options.view = settings.defaultView;
                    this.showView(options).then(function(view) {
                        settings.onHashChange(view);
                    });
                }
            }
        };
        this.setGlobalOnAttached = function(callback) {
            settings.globalOnAttached = callback;
        };
        this.showView = function(options) {

            var view = options.view;
            if (!view) {
                throw new Error("options.view must be specified");
            }

            this.ensureInitialized();

            var target = options.target || settings.target;
            // Make copy
            var defaults = {
                params: {},
                args: {}
            };
            defaults = $.extend({}, defaults, options);
            defaults.target = target;
            defaults._options = options;

            addGlobalErrorHandler(target);

            if (typeof (callStack[target]) === 'undefined') {
                callStack[target] = [];
            }

            var deferredHolder = that.createDeferreds();

            if (callStack[target].length !== 0) {
                console.warn("[ViewManager.showView] ViewManager is already processing a showView/showHTML request for the target '" + target + "' and options: ", options, ". Use ViewManager.clear('" + target + "') to force a showView/showHTML request.", callStack[target]);
                deferredHolder.reject();
                return deferredHolder.promises;
            }

            if (templateEngine.hasActions()) {
                console.warn("It's been detected that there are unbounded actions in the TemplateEngine! Make sure to call templateEngine.bind() after template is added to DOM. Resetting TemplateEngine to remove memory leaks!");
                templateEngine.reset(target);
            }

            callStack[target].push(1);

            if (typeof view === 'string') {

                require([view], function(View) {
                    that.commonShowView(View, deferredHolder, defaults);
                });

            } else if (view instanceof Function) {
                this.commonShowView(view, deferredHolder, defaults);
            }

            return deferredHolder.promises;
        };

        this.createDeferreds = function() {
            var deferredHolder = {
                reject: function() {
                    mainDeferred.reject();
                    attachedDeferred.reject();
                    visibleDeferred.reject();
                }
            };

            var mainDeferred = $.Deferred();
            var attachedDeferred = $.Deferred();
            var visibleDeferred = $.Deferred();

            var promises = mainDeferred.promise();
            promises.attached = attachedDeferred.promise();
            promises.visible = visibleDeferred.promise();

            deferredHolder.mainDeferred = mainDeferred;
            deferredHolder.attachedDeferred = attachedDeferred;
            deferredHolder.visibleDeferred = visibleDeferred;
            deferredHolder.promises = promises;
            return deferredHolder;
        };

        this.commonShowView = function(view, deferredHolder, defaults) {

            // Check if invokeWithNew has been set yet
            if (typeof view.invokeWithNew === "undefined") {

                var invokewithNew = utils.isInvokeFunctionWithNew(view);
                view.invokeWithNew = invokewithNew;
            }

            if (view.invokeWithNew) {
                // Function name starts with uppercase so invoke with "new"
                defaults.view = new view();

            } else {
                // Function name is lowercase so invoke without "new"
                defaults.view = view();
            }

            defaults.deferredHolder = deferredHolder;
            that.showViewInstance(defaults);
        };

        this.hasMovedToNewView = function(route) {
            var currentViewName = $.spamd.history.params().page;
            if (currentViewName === route) {
                return false;
            }

            if (typeof currentViewName === "undefined") {
                currentViewName = "/";
            }
            console.info("You have moved to a new view. From '" + currentViewName + "' to '" + route + "'");
            return true;

        };

        this.showViewInstance = function(options) {
            console.log("SHOW VIEW INSTANCE");
            var view = options.view;
            setCurrentView(view, options);
            var viewPath = view.id;
            var args = options.args;
            var params = options.params;
            var deferredHolder = options.deferredHolder;

            processHashChange = false;
            var route = routesByPath[viewPath] || viewPath;
            $.spamd.history.params.set(params);

            var newView = this.hasMovedToNewView(route);
            if (newView) {
                $.spamd.history.clear();
            }
            $.spamd.history.params.set({page: route});

            $.spamd.history.update();
            processHashChange = true;

            var dom = function() {
                var parent = that;
                var me = {};

                me.attach = function(html, domOptions) {
                    var domDefaults = {animate: settings.animate};
                    domDefaults = $.extend({}, domDefaults, domOptions);

                    var onAttached = function() {
                        deferredHolder.attachedDeferred.resolve(view);
                        // In case user forgot to bind. TODO this call could be slow if DOM is large, so make autobind configurable
                        if (templateEngine.hasActions()) {
                            if (settings.bindTemplate === false) {
                                console.info("When rendering the target '" + options.target + "' it was detected that templateEngine had unbounded Actions. " +
                                        "Remember to call templateEngine.bind(target) otherwise your actions rendered with Handlebars won't fire!");
                                return;
                            }
                        }
                    };

                    var onVisible = function() {
                        deferredHolder.visibleDeferred.resolve(view);
                    };

                    options.onAttached = onAttached;
                    options.onVisible = onVisible;
                    options.viewAttached = parent.viewAttached;
                    options.viewVisible = parent.viewVisible;
                    if (domDefaults.animate) {
                        settings.animateHandler(html, options);
                    } else {
                        settings.attachHandler(html, options);
                        //parent.attachView(html, options);
                    }
                    //});

                    var attachedPromise = deferredHolder.promises.attached;

                    me.attached = attachedPromise;
                    me.visible = deferredHolder.promises.visible;
                    //result.attached = attachedPromise;
                    //result.visible = visiblePromise;


                    attachedPromise.visible = me.visible;
                    attachedPromise.attached = me.attached;
                    return attachedPromise;
                    //return this;
                };


                me.cancel = function() {
                    var cancelDeferred = $.Deferred();
                    setTimeout(function() {
                        var target = options.target;
                        parent.clear(target);
                        cancelDeferred.resolve(view);
                    });
                    return cancelDeferred.promise();
                };
                return me;
            }();

            //console.log("view.oninit", view.onInit);
            if (!view.onInit) {
                throw new Error("Views must have a public 'onInit' method!");
            }

            var viewOptions = {};
            viewOptions.path = route;
            var initOptions = {args: args, params: params, hashChange: options.hashChange, view: viewOptions};
            view.onInit(dom, initOptions);
            //return result;
        };

        this.showHTML = function(options) {
            //this.init();
            this.ensureInitialized();
            var target = options.target || settings.target;
            var defaults = {animate: settings.animate};
            defaults = $.extend({}, defaults, options);
            defaults._options = options;
            defaults.target = target;

            addGlobalErrorHandler(target);

            var deferredHolder = that.createDeferreds();
            defaults.deferredHolder = deferredHolder;

            if (typeof (callStack[target]) === 'undefined') {
                callStack[target] = [];
            }

            if (callStack[target].length !== 0) {
                console.warn("[ViewManager.showHTML] ViewManager is already processing a showView/showHTML request for the target '" + target + "'. Use ViewManager.clear('" + target + "') to force a showView/showHTML request.", callStack[target]);
                deferredHolder.reject();
                return deferredHolder.promises;
            }

            if (templateEngine.hasActions()) {
                //console.info("It's been detected in showHTML that there are unbounded actions in the TemplateEngine! Make sure to call templateEngine.bind() after template is added to DOM. Resetting to remove memory leaks!");
                //templateEngine.reset(target);
            }

            var html = defaults.html;

            callStack[target].push(1);

            //setTimeout(function() {
            var onAttached = function() {
                //that.clear(options.target);

                deferredHolder.attachedDeferred.resolve(html);
                // In case user forgot to bind. TODO this call could be slow if DOM is large, so make autobind configurable
                if (templateEngine.hasActions()) {
                    //console.info("autobinding template actions since templateEngine has unbounded actions!");
                    //templateEngine.bind(target);
                }
            };

            var onVisible = function() {
                deferredHolder.visibleDeferred.resolve(html);
            };

            defaults.onAttached = onAttached;
            defaults.onVisible = onVisible;
            defaults.viewAttached = that.viewAttached;
            defaults.viewVisible = that.viewVisible;
            if (defaults.animate) {
                settings.animateHandler(html, defaults);
            } else {
                settings.attachHandler(html, defaults);
            }

            return deferredHolder.promises;
        };

        this.attachView = function(html, options) {
            var target = options.target;
            var viewAttached = options.viewAttached;
            var viewVisible = options.viewVisible;
            var $target = $(target);
            if ($target.length === 0) {
                throw new Error("The showView/showHTML target '" + target + "' does not exist in the DOM!");
            }
            $target.empty();
            $target.html(html);
            viewAttached(options);
            viewVisible(options);
        };
        this.viewAttached = function(options) {
            if (settings.globalOnAttached != null) {
                var origOptions = options._options;
                settings.globalOnAttached(origOptions);
            }

            var onAttached = options.onAttached;
            if (onAttached) {
                onAttached();
            }

            var target = options.target;

            // In case user forgot to bind. TODO this call could be slow if DOM is large, so make autobind configurable
            if (templateEngine.hasActions()) {
                // In case user forgot to bind. TODO this call could be slow if DOM is large, so make autobind configurable
                if (settings.bindTemplate === false) {
                    //console.info("When rendering the target '" + target + "' it was detected that templateEngine had unbounded Actions. " +
                    //"Remember to call templateEngine.bind(target) otherwise your actions rendered with Handlebars won't fire!");
                    return;
                }
                // TODO should we auto bind at all?? Simply warn the user?

                var total = -1;
                if (performance) {
                    var t0 = performance.now();
                    templateEngine.bind(target);
                    var t1 = performance.now();
                    total = (t1 - t0);
                    total = total.toFixed(2);
                    var threshold = 20; // millis
                    if (total > threshold) {
                        console.warn("Binding the template actions took" + total + " milliseconds. You can optimize TemplateEngine.bind time by" +
                                " manually binding on a specific target eg. templateEngine.bind('#myTable'). This ensures the whole DOM in the target, '" +
                                target + "', is not scanned for actions to bind. ");
                    }

                } else {
                    templateEngine.bind(target);
                }

                console.info("autobinding template actions since templateEngine has unbounded actions. Binding actions of target '" + target
                        + "' took " + total + " milliseconds");

            }
        };
        this.viewVisible = function(options) {

            var target = options.target;
            var view = options.view;

            var onVisible = options.onVisible;
            if (onVisible) {
                onVisible();
            }

            if (!options.deferredHolder) {
                throw new Error("options.deferredHolder is required!");
            }
            var mainDeferred = options.deferredHolder.mainDeferred;
            if (mainDeferred) {
                mainDeferred.resolve(view);
            }

            that.clear(target);
            removeGlobalErrorHandler(target);
        };
        this.attachViewWithAnim = function(html, options) {

            var target = options.target;
            var $target = $(target);
            if ($target.length === 0) {
                throw new Error("The showView/showHTML target '" + target + "' does not exist in the DOM!");
            }
            var viewAttached = options.viewAttached;
            var viewVisible = options.viewVisible;
            $target.fadeOut('fast', function() {

                $target.empty();
                $target.html(html);
                viewAttached(options);
                $target.fadeIn('fast', function() {
                    viewVisible(options);
                });
            });
        };

        this.clear = function(target) {
            var obj = callStack[target];
            if (obj) {
                obj.pop();
                if (obj.length === 0) {
                    delete callStack[target];
                }
            }
        };
        this.getCurrentView = function() {
            if (currentView) {
                return currentView.view;
            }
            return null;
        };

        this.ensureInitialized = function() {
            if (initialized) {
                return;
            }
            throw new Error("ViewManager has not been initialized. Call ViewManager.init() before showView/showHTML."
                    + "This often occur because RequireJS loading order is incorrect eg. setup.js is loaded before main.js!");
        }

        function setCurrentView(view, options) {
            if (currentView.view && currentView.view.onDestroy) {

                currentView.view.onDestroy(currentView.options);
            }
            currentView = {view: view, options: options};
        }

        function removeGlobalErrorHandler(target) {
            var i = $.inArray(target, errorHandlerStack);
            if (i !== -1) {
                errorHandlerStack.splice(i, 1);
            }
        }

        function addGlobalErrorHandler(target) {
            var i = $.inArray(target, errorHandlerStack);
            if (i !== -1) {
                return;
            }

            if (errorHandlerStack.length >= 1) {
                errorHandlerStack.push(target);
                return;
            }

            errorHandlerStack.push(target);
            if (window.onerror === globalErrorHandler) {
                return;
            }

            var prevError = window.onerror;
            globalErrorHandler.prevError = prevError;
            window.onerror = globalErrorHandler;
        }

        function globalErrorHandler(message, url, lineNumber) {
            for (var i = 0; i < errorHandlerStack.length; i++) {
                var target = errorHandlerStack[i];
                targetErrorHandler(message, url, lineNumber, target);
            }

            var prevError = globalErrorHandler.prevError;

            if (prevError) {
                prevError(message, url, lineNumber);
            }
        }

        function targetErrorHandler(message, url, lineNumber, target) {
            that.clear(target);
            var $target = $(target);
            $target.finish();
            $target.clearQueue().stop(true, true);
            setTimeout(function() {
                $target.css({'opacity': '1', 'display': 'block'});
            }, 10);
            return false;
        }
    }

    var manager = new ViewManager();
    return manager;
});