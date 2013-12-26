define(function(require) {

    var $ = require("jquery");
    require("domReady!");
    //require("jquery.address");
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
            globalOnAttached: $.noop
        };

        var processHashChange = true;

        var initialized = false;
        var routesByName = {};
        var routesByPath = {};
        var callStack = {};
        var errorHandlerStack = [];

        //this.hash = {
        //};

        this.setRoutes = function(map) {
            if (map == null) {
                return;
            }

            routesByName = map;
            routesByPath = {};
            //console.log("RoutesMap is now empy!");
            for (var prop in routesByName) {
                routesByPath[routesByName[prop]] = prop;
            }
            //console.log("RoutesMap is now populated!");
            //console.log("routesByPath", routesByPath);
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

            //var defaultView;

            //if (options) {
            settings = $.extend({}, settings, options);
            //var defaultView = options.defaultView;
            //var routes = options.routes;
            //defaultTarget = options.target || defaultTarget;
            //if (typeof options.animate !== 'undefined') {
            //  defaultAnimate = options.animate;
            //}
            //animateHandler = options.animateHandler || that.attachViewWithAnim;
            //attachHandler = options.attachHandler || that.attachView;
            //console.log("setting Routes", routes);
            this.setRoutes(settings.routes);
            //onHashChange = settings.onHashChange;
            //}

            //$.address.strict(false);

            //$.address.state("http://localhost:9988/").init(function() {
            //});
            //$.address.autoUpdate(false);
            //$.address.change(function(event) {
            //console.log("HISTORY REGISTERED", $.spamd);
            //console.log("HISTORY REGISTERED", $.spamd.history);


            $.spamd.history.init(function(newHash, initial) {

                //console.log('Hash "' + newHash + '"');
                if (initial) {
                    //console.log('Initial Hash is "' + newHash + '"');
                } else {
                    //console.log('Hash changed to "' + newHash + '"');
                }

                //event.preventDefault();
                //event.stopPropagation();

                console.log("PROCESS HASH CHANGE OVER", processHashChange);

                if (processHashChange) {

                    processHashChange = false;

                    //var viewName = event.path;
                    //var viewName = event.parameters.page;
                    //if (!$.spamd.history.disable()) {

                    //}
                    var viewName = $.spamd.history.params().page;
                    var viewPath = routesByName[viewName];
                    if (!viewPath) {
                        viewPath = viewName;
                    }
                    //console.log("address.change ViewName", viewName);

                    if (viewPath) {// ensure path is not blank
                        //if (name !== event.path) { // ensure we don't process path twice
                        //console.log("name", viewPath, "event.path", event.path);
                        //var params = event.parameters;
                        var params = $.spamd.history.params.get();
                        //console.log("URL PArams", params);
                        //console.log("initial ShowView for:", viewPath);
                        //console.log("showView called from HASH", viewPath);
                        that.showView({view: viewPath, params: params, hashChange: true}).then(function(view) {
                            //if (settings.onHashChange) {
                                //console.log("show HASH view deferred", view);
                                settings.onHashChange(view);
                            //}
                            processHashChange = true;
                        });
                        //}
                    }
                }
            });
            //console.log("address path", $.address.path());
            //var hasPage = $.address.parameter("page");
            var hasPage = $.spamd.history.params().page;
            //var hasPage = $.address.path();
            if (hasPage) {
                $.spamd.history.update();
            } else {

                if (settings.defaultView) {
                    options.view = settings.defaultView;
                    //console.log("show defaultView called");
                    this.showView(options).then(function(view) {
                        //console.log("show default view deferred", view);
                        //if (settings.onHashChange) {
                            settings.onHashChange(view);
                        //}
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

            //this.init();
            this.ensureInitialized();

            //var args = options.args;
            //var params = options.params;

            //var onViewReady = options.onViewReady;
            var target = options.target || settings.target;
            // Make copy
            var defaults = {
                params: {},
                args: {}
            };
            defaults = $.extend({}, defaults, options);
            defaults.target = target;
            defaults._options = options;

            // Setup global error handler in case user doen't use try/catch logic
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
                console.info("It's been detected that there are unbounded actions in the TemplateEngine! Make sure to call templateEngine.bind() after template is added to DOM. Resetting TemplateEngine to remove memory leaks!");
                templateEngine.reset(target);
            }

            callStack[target].push(1);


            if (typeof view === 'string') {

                require([view], function(View) {
                    that.commonShowView(View, deferredHolder, defaults);
                    /*
                     defaults.view = new View();
                     
                     options.viewInstance = defaults.view;
                     defaults.mainDeferred = mainDeferred;
                     that.showViewInstance(defaults);
                     
                     return mainDeferred.promise();
                     */
                });

            } else if (view instanceof Function) {
                this.commonShowView(view, deferredHolder, defaults);
                //defaults.view = new view();
            }

            return deferredHolder.promises;

            /*
             options.viewInstance = defaults.view;
             var mainDeferred = $.Deferred();
             defaults.mainDeferred = mainDeferred;
             //setTimeout(function() {
             var result = that.showViewInstance(defaults);
             //});
             
             var mainPromise = mainDeferred.promise();
             mainPromise.attached = result.attached;
             mainPromise.visible = result.visible;
             return mainPromise;
             */
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

            //options.viewInstance = defaults.view;

            //defaults.mainDeferred = deferredHolder.mainDeferred;
            //setTimeout(function() {
            defaults.deferredHolder = deferredHolder;
            that.showViewInstance(defaults);
            //});
            /*
             var mainPromise = mainDeferred.promise();
             mainPromise.attached = result.attached;
             mainPromise.visible = result.visible;
             return mainPromise;
             */
        };

        this.hasMovedToNewView = function(route) {
            var currentViewName = $.spamd.history.params().page;
            //var url = $.parseUrl(location.href);
            //var currentViewName = url.params.page;
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
            //var onViewReady = options.onViewReady;
            //var target = options.target;

            processHashChange = false;
            var route = routesByPath[viewPath] || viewPath;
            $.spamd.history.params.set(params);
            //$.address.autoUpdate(false);
            //$.address.value(route);
            /*
             for (var param in params) {
             var val = params[param];
             //$.spamd.history.params.add({param : item});
             
             if ($.isArray(val)) {
             for (var i = 0; i < val.length; i++) {
             var item = val[i];
             //$.address.parameter(param, item, true);
             $.spamd.history.params.add({param : item});
             }
             } else {
             $.spamd.history.params.add({param : item});
             //$.address.parameter(param, val);
             }
             }*/
            var newView = this.hasMovedToNewView(route);
            if (newView) {
                //$.address.value("");
                $.spamd.history.clear();
            }
            //$.address.value("");
            $.spamd.history.params.set({page: route});

            $.spamd.history.update();
            processHashChange = true;
            //$.address.value(viewName);
            //route[viewName] = arguments;
            //$.address.parameter("pok", "moo");
            //console.log("param", $.address.parameter("pok"));

            //var result = {};

            var dom = function() {
                var parent = that;
                var me = {};

                //var attachedDeferred = $.Deferred();
                //var visibleDeferred = $.Deferred();

                //var visiblePromise = visibleDeferred.promise();
                //var attachedPromise = attachedDeferred.promise();

                me.attach = function(html, domOptions) {
                    var domDefaults = {anim: settings.animate};
                    domDefaults = $.extend({}, domDefaults, domOptions);


                    //setTimeout(function() {
                    var onAttached = function() {
                        //parent.clear(options.target);
                        deferredHolder.attachedDeferred.resolve(view);
                        // In case user forgot to bind. TODO this call could be slow if DOM is large, so make autobind configurable
                        if (templateEngine.hasActions()) {
                            console.info("Remember to call templateEngine.bind(target) otherwise your actions rendered with Handlebars won't fire!");
                            // TODO shoulld we auto bind at all?? Simply warn the user?
                            //templateEngine.bind(options.target);
                        }
                    };

                    var onVisible = function() {
                        deferredHolder.visibleDeferred.resolve(view);
                    };

                    options.onAttached = onAttached;
                    options.onVisible = onVisible;
                    options.viewAttached = parent.viewAttached;
                    options.viewVisible = parent.viewVisible;
                    if (domDefaults.anim) {
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
            var defaults = {anim: settings.animate};
            defaults = $.extend({}, defaults, options);
            defaults._options = options;
            defaults.target = target;
            // TODO setup window.error
            addGlobalErrorHandler(target);
            /*
             var curr = window.onerror;
             window.onerror = function(message, file, lineNumber) {
             that.clear(target);
             if (curr) {
             curr(arguments);
             window.onerror = curr;
             }
             return false;
             };*/

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
            if (defaults.anim) {
                //that.attachViewWithAnim(html, defaults);
                settings.animateHandler(html, defaults);
            } else {
                //that.attachView(html, defaults);
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

            // In case user forgot to bind. TODO this call could be slow if DOM is large, so make autobind configurable
            /*if (templateEngine.hasActions()) {
             console.info("autobinding template actions since templateEngine has unbounded actions!");
             templateEngine.bind(target);
             }*/
        };
        this.viewVisible = function(options) {

            var target = options.target;
            var view = options.view;
            //var onViewReady = options.onViewReady;

            //if (options.domOnVisible) {
            //options.domOnVisible(view);
            //}

            var onVisible = options.onVisible;
            if (onVisible) {
                onVisible();
            }

            if (!options.deferredHolder) {
                throw new Error("options.deferredHolder is required!");
            }
            var mainDeferred = options.deferredHolder.mainDeferred;
            //console.log("MAIN?", mainDeferred);
            if (mainDeferred) {
                mainDeferred.resolve(view);
            }

            that.clear(target);
            removeGlobalErrorHandler(target);
        };
        // TODO Replace this method for alternate animation
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
            //console.log("globalErrorHandler removing", target);
            var i = $.inArray(target, errorHandlerStack);
            if (i !== -1) {
                errorHandlerStack.splice(i, 1);
                //console.log("globalErrorHandler removed", target);
            }
        }

        function addGlobalErrorHandler(target) {
            //console.log("addGlobalErrorHandler", target);
            var i = $.inArray(target, errorHandlerStack);
            if (i !== -1) {
                return;
            }

            if (errorHandlerStack.length >= 1) {
                errorHandlerStack.push(target);
                //console.log("addGlobalErrorHandler already present", target);
                return;
            }

            errorHandlerStack.push(target);
            if (window.onerror === globalErrorHandler) {
                //console.log("globalErrorHandler is already se as window.onerror");
                return;
            }

            var prevError = window.onerror;
            globalErrorHandler.prevError = prevError;
            window.onerror = globalErrorHandler;
        }

        function globalErrorHandler(message, url, lineNumber) {
            //console.log("Global called");
            //console.log("Old error", globalErrorHandler.prevError);
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
            //console.log("targetErrorHandler for " + target, message, url, lineNumber);
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
    //manager.init();
    return manager;
});