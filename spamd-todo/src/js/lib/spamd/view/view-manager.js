define(function(require) {

    var $ = require("jquery");
    require("domReady!");
    require("spamd/history/history");
    var params = require("spamd/utils/params");
    var utils = require("../utils/utils");
    var hash = require("spamd/history/hash");
    var templateEngine = require("../template/template-engine");
    function ViewManager() {

        var that = this;

        var currentViews = {};

        /*var currentView = {
         view: null,
         options: null
         };*/

        var settings = {
            defaultView: null,
            target: "#container",
            animate: true,
            animateHandler: null,
            attachHandler: null,
            onHashChange: $.noop,
            globalOnAttached: $.noop,
            bindTemplate: true,
            updateHistory: true
        };
        var currentHash = null;
        var processHashChange = true;

        var initialized = false;
        var routesByName = {};
        var routesByPath = {};
        var callStack = {}; // TODO put limit on how many requests the callStack can hold
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

            $.spamd.history.init(function(hashOptions) {
                //console.warn("External?", options.external);

                //console.log("PROCESS HASH CHANGE OVER", processHashChange);
                //console.log("NEW HASH", options.newHash, "old hash", options.oldHash, "Prcess HASH", processHashChange);
                var oldPage = params(hashOptions.oldHash).get().page;

                if (processHashChange) {

                    processHashChange = false;

                    var historyParams = $.spamd.history.params();
                    var viewName = historyParams.page;
                    var viewPath = routesByName[viewName] || viewName;
                    //if (!viewPath) {
//                        viewPath = viewName;
//                    }

                    if (viewPath) {// ensure path is not blank
                        var movedToNewView = that.hasMovedToNewView(oldPage);
                        if (!hashOptions.initial && !movedToNewView) {

                            //notify hash changes
                            var views = that.getCurrentViews();
                            $.each(views, function(i, view) {
                                $(view.options.hash).trigger("onHashChange", hashOptions);
                            });
                            processHashChange = true;
                        
                            return;
                        }
                        
                        

                        var viewParams = $.spamd.history.params.get();
                        delete viewParams.page;
                        //console.log("hash shows new view", viewPath, " with params", viewParams);
                        //console.log("2", location.href);
                        that.showView({view: viewPath, params: viewParams, hashChange: true, externalHashChange: hashOptions.external}).then(function(view) {
                            settings.onHashChange(view);
                            processHashChange = true;
                        });
                    } else {
                        processHashChange = true;
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
                        var hashOptions = {view: view};
                        $(that).trigger("onHashChange", [hashOptions]);
                    });
                }
            }
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
                args: {},
                bindTemplate: settings.bindTemplate,
                animate: settings.animate,
                updateHistory: settings.updateHistory,
                overwritten: false,
                externalHashChange: false
            };
            var viewSettings = $.extend({}, defaults, options);
            viewSettings.target = target;
            viewSettings._options = options;

            addGlobalErrorHandler(target);


            if (typeof (callStack[target]) === 'undefined') {
                callStack[target] = [];
            }

            var deferredHolder = that.createDeferreds();

            // The timeout below allows the attached promise to be returned to the caller before running the function.
            setTimeout(function() {

                if (callStack[target].length !== 0) {
                    //console.warn("ViewSettings.animate", viewSettings.animate);
                    //viewSettings.animate = false;
                    //console.warn("ViewSettings.animate", viewSettings.animate);

                    //console.warn("[ViewManager.showView] ViewManager is already processing a showView/showHTML request for the target '" + target + "' and options: ", options, ". Use ViewManager.clear('" + target + "') to force a showView/showHTML request.", callStack[target]);
                    //deferredHolder.reject();
                    //return deferredHolder.promises;
                }

                if (templateEngine.hasActions()) {
                    //console.warn("It's been detected that there are unbounded actions in the TemplateEngine! Make sure to call templateEngine.bind() after template is added to DOM!");
                    //console.warn("It's been detected that there are unbounded actions in the TemplateEngine! Make sure to call templateEngine.bind() after template is added to DOM. Resetting TemplateEngine to remove memory leaks!");                //
                    //templateEngine.reset(target);
                } else {
                    //console.info("Template has no actions");
                }
                var next = {
                    viewSettings: viewSettings,
                    deferredHolder: deferredHolder
                };
                //console.error("next", next.viewSettings.view);

                callStack[target].push(next);
                if (callStack[target].length > 1) {
                    //next.viewSettings.animate = false;
                    $.fx.off = true;
                    //console.warn("o", callStack[target]);
                    $(target).stop(true, true);
                    //console.warn("k", callStack[target]);

                    // Cancel all calls except the latest view just added
                    var cs = callStack[target];
                    if (typeof cs !== 'undefined') {
                        for (var i = 0; i < cs.length - 1; i++) {
                            var tempNext = callStack[target][i];
                            var tempViewSettings = tempNext.viewSettings;
                            if (tempViewSettings.overwritten === false) {
                                tempViewSettings.overwritten = true;
                                console.warn("OVERRITTEN");

                                tempViewSettings.deferredHolder.overwriteDeferred.resolve(tempViewSettings.view);

                                if (tempViewSettings.container) {

                                    // TODO turn cancelled into a promise
                                    /*
                                     if (tempViewSettings.container.cancelled) {
                                     tempViewSettings.container.cancelled();
                                     }*/
                                    tempViewSettings.container.cancel();
                                }

                            }
                        }
                    }

                    //return deferredHolder.promises;
                } else {
                    //console.error("Callstack DROPPED to 0");
                }

                //console.warn("hasActions", templateEngine.hasActions());

                that.resolveViewAndShow(view, deferredHolder, viewSettings);
            });

            return deferredHolder.promises;
        };

        this.createDeferreds = function() {
            var mainDeferred = $.Deferred();
            var attachedDeferred = $.Deferred();
            var visibleDeferred = $.Deferred();
            var cancelDeferred = $.Deferred();
            var overwriteDeferred = $.Deferred();

            var promises = mainDeferred.promise();
            promises.attached = attachedDeferred.promise();
            promises.visible = visibleDeferred.promise();
            promises.cancel = cancelDeferred.promise();
            promises.overwrite = overwriteDeferred.promise();

            var deferredHolder = {
                reject: function() {
                    mainDeferred.reject();
                    attachedDeferred.reject();
                    visibleDeferred.reject();
                    cancelDeferred.reject();
                    overwriteDeferred.reject();
                    $(this).trigger("global.attached.fail");
                    $(this).trigger("global.visible.fail");
                    $(this).trigger("global.cancel.fail");
                    $(this).trigger("global.overwrite.fail");
                }
            };

            deferredHolder.mainDeferred = mainDeferred;
            deferredHolder.attachedDeferred = attachedDeferred;
            deferredHolder.visibleDeferred = visibleDeferred;
            deferredHolder.cancelDeferred = cancelDeferred;
            deferredHolder.overwriteDeferred = overwriteDeferred;
            deferredHolder.promises = promises;
            return deferredHolder;
        };

        this.resolveViewAndShow = function(view, deferredHolder, viewSettings) {
            if (typeof view === 'string') {
                // If view is a route, resolve to it's path. Otherwise assume view is it's path
                view = routesByName[view] || view;

                require([view], function(View) {
                    that.commonShowView(View, deferredHolder, viewSettings);
                });

            } else {
                this.commonShowView(view, deferredHolder, viewSettings);
            }
        };

        this.overwrite = function(view, deferredHolder, viewSettings) {
            if (viewSettings.overwrittenCompleted === true) {
                //console.log("Already overwritten, returning");
                return;
            }
            viewSettings.overwrittenCompleted = true;
            console.warn("request overwritten -> rejecting deferreds, clearing target");
            console.warn("resetting template engine");
            templateEngine.reset();
            //deferredHolder.reject();
            var target = viewSettings.target;
            this.clear(target);
            console.warn("overwritten done -> exiting");

            // Process the next showView request

            //TODO test if code below is needed or not
            /*
             if (typeof callStack[target] !== 'undefined') {
             if (callStack[target].length >= 1) {
             console.log("HUOH");
             var next = callStack[target][0];
             //console.error("show common", next.viewSettings.view);
             that.resolveViewAndShow(next.viewSettings.view, next.deferredHolder, next.viewSettings);
             }
             }
             return;
             */
        };

        this.commonShowView = function(view, deferredHolder, viewSettings) {
            if (viewSettings.overwritten === true) {
                return this.overwrite(view, deferredHolder, viewSettings);
            }

            // Check if invokeWithNew has been set yet
            if (typeof view.invokeWithNew === "undefined") {

                var invokewithNew = utils.isInvokeFunctionWithNew(view);
                view.invokeWithNew = invokewithNew;
            }

            if (view instanceof Function) {
                // View must be instantiated
                if (view.invokeWithNew) {
                    // Function name starts with uppercase so invoke with "new"
                    viewSettings.view = new view();

                } else {
                    // Function name is lowercase so invoke without "new"
                    viewSettings.view = view();
                }

                if (viewSettings.view.id == null) {
                    viewSettings.view.id = view.id;
                }

            } else {
                // View already instantiated
                viewSettings.view = view;
            }
            //viewSettings.view._created = true;

            viewSettings.deferredHolder = deferredHolder;
            that.showViewInstance(viewSettings);
        };

        this.hasMovedToNewView = function(route) {
            //console.log("3", location.href);
            var currentViewName = $.spamd.history.params().page;
            if (currentViewName === route) {
                //console.info("You have NOT moved to a new view. From '" + currentViewName + "' to '" + route + "'");
                return false;
            }

            if (typeof currentViewName === "undefined") {
                currentViewName = "/";
            }
            //console.info("You have moved to a new view. From '" + currentViewName + "' to '" + route + "'");
            return true;
        };
        
        this.showViewInstance = function(viewSettings) {
            if (viewSettings.overwritten === true) {
                return this.overwrite(view, viewSettings.deferredHolder, viewSettings);
            }
            
            viewSettings.hash = {id: Math.random()};

            var target = viewSettings.target;
            var isMainViewReplaced = target === settings.target;
            //isMainViewReplaced=true;

            var view = viewSettings.view;

            var args = viewSettings.args;
            var deferredHolder = viewSettings.deferredHolder;

            processHashChange = false;

            var viewPath = view.id;
            //console.log("2.5", location.href, " ViewPath", viewPath);
            var route = routesByPath[viewPath] || viewPath;

            // Only change history if the new view replaces the main view. Else this is a subview request,
            // we don't change the view url, except add new parameters
            if (isMainViewReplaced) {
                var movedToNewView = this.hasMovedToNewView(route);
                currentHash = $.spamd.history.hash();
                //console.log("movedToNewView", movedToNewView);
                if (movedToNewView) {
                    $.spamd.history.clear();
                }
                $.spamd.history.params.set({page: route});
            }
            //console.log("5", location.href);

            var viewParams = viewSettings.params;
            $.spamd.history.params.set(viewParams);

            if (viewSettings.updateHistory) {
                $.spamd.history.update();
            }
            processHashChange = true;

            var container = function() {
                var parent = that;
                var me = {};

                me.attached = deferredHolder.promises.attached;
                me.visible = deferredHolder.promises.visible;
                me.overwrite = deferredHolder.promises.overwrite;

                me.attach = function(html, containerOptions) {

                    // The timeout below allows the attached promise to be returned to the caller before running the function.
                    setTimeout(function() {
                        if (viewSettings.overwritten === true) {
                            console.warn("likely??");
                            that.overwrite(view, viewSettings.deferredHolder, viewSettings);
                            return deferredHolder.promises.attached;
                        }
                        var previousView = setCurrentView(view, viewSettings);
                        viewSettings.previousView = previousView;

                        var containerDefaults = {
                            animate: viewSettings.animate,
                            bindTemplate: viewSettings.bindTemplate
                        };

                        var containerSettings = $.extend({}, containerDefaults, containerOptions);

                        var onAttached = function() {

                            //setTimeout(function() {
                            var isMainViewReplaced = target === settings.target;
                            var triggerOptions = {
                                oldView: viewSettings.previousView,
                                newView: view,
                                isMainView: isMainViewReplaced,
                                viewSettings: viewSettings
                            };
                            $(that).trigger("global.attached", [triggerOptions]);

                            deferredHolder.attachedDeferred.resolve(view);

                            // In case user forgot to bind. TODO this call could be slow if DOM is large, so make autobind configurable
                            if (templateEngine.hasActions()) {
                                if (containerSettings.bindTemplate === false) {
                                    console.info("When rendering the target '" + viewSettings.target + "' it was detected that templateEngine had unbounded Actions. " +
                                            "Remember to call templateEngine.bind(target) otherwise your actions rendered with Handlebars won't fire!");
                                    return;
                                }
                            }
                            //});
                        };

                        var onVisible = function() {
                            //setTimeout(function() {

                            var triggerOptions = {
                                oldView: viewSettings.previousView,
                                newView: view,
                                isMainView: isMainViewReplaced,
                                viewSettings: viewSettings
                            };
                            // TODO perhaps a global.before.visible and global.after.visible???
                            $(that).trigger("global.visible", [triggerOptions]);

                            deferredHolder.visibleDeferred.resolve(view);
                            //});
                        };

                        viewSettings.onAttached = onAttached;
                        viewSettings.onVisible = onVisible;
                        viewSettings.viewAttached = parent.viewAttached;
                        viewSettings.viewVisible = parent.viewVisible;
                        viewSettings.bindTemplate = containerSettings.bindTemplate;

                        // If showView is result of HashChange we don't do animation
                        var hashChange = viewSettings.hashChange;

                        if (containerSettings.animate && !hashChange) {
                            //console.warn("show animate");
                            //settings.animateHandler(html, viewSettings);
                            that.commonAttachViewWithAnim(html, viewSettings);

                        } else {
                            //console.warn("show attach");
                            //settings.attachHandler(html, viewSettings);
                            that.commonAttachView(html, viewSettings);
                        }

                        //me.attached.visible = me.visible;
                        //me.attached.attached = me.attached;
                    });
                    return me.attached;
                };

                me.cancel = function() {
                    if (viewSettings.overwritten === true) {
                        return that.overwrite(view, viewSettings.deferredHolder, viewSettings);
                    }
                    processHashChange = false;
                    $.spamd.history.hash(currentHash);
                    currentHash = null;
                    $.spamd.history.update();
                    processHashChange = true;

                    var cancelPromise = deferredHolder.promises.cancel;
                    var cancelDeferred = deferredHolder.cancelDeferred;

                    var target = viewSettings.target;
                    parent.clear(target);
                    var currentView = that.getCurrentView(target);
                    cancelDeferred.resolve(currentView, view);
                    var isMainViewReplaced = target === settings.target;
                    var triggerOptions = {
                        oldView: currentView,
                        newView: view,
                        isMainView: isMainViewReplaced,
                        viewSettings: viewSettings
                    };
                    $(that).trigger("global.cancel", [triggerOptions]);

                    return cancelPromise;
                };
                return me;
            }();
            //console.log("view.oninit", view.onInit);
            if (!view.onInit) {
                throw new Error("Views must have a public 'onInit' method!");
            }

            if (viewSettings.overwritten === true) {
                return that.overwrite(view, viewSettings.deferredHolder, viewSettings);
            }
            viewSettings.container = container;

            var viewOptions = {};
            viewOptions.path = route;
            var initOptions = {
                args: args,
                params: viewParams,
                hashChange: viewSettings.hashChange,
                hash: viewSettings.hash,
                view: viewOptions
            };

            if (viewSettings.overwritten === true) {
                return this.overwrite(view, viewSettings.deferredHolder, viewSettings);
            }

            view.onInit(container, initOptions);
            //return result;
        };

        this.showHTML = function(options) {
            this.ensureInitialized();
            var target = options.target || settings.target;
            var defaults = {
                animate: settings.animate,
                bindTemplate: settings.bindTemplate,
                overwritten: false
            };
            var viewSettings = $.extend({}, defaults, options);
            viewSettings._options = options;
            viewSettings.target = target;

            addGlobalErrorHandler(target);

            var deferredHolder = that.createDeferreds();

            // The timeout below allows the attached promise to be returned to the caller before running the function.
            setTimeout(function() {
                viewSettings.deferredHolder = deferredHolder;

                if (typeof (callStack[target]) === 'undefined') {
                    callStack[target] = [];
                }

                if (callStack[target].length !== 0) {
                    console.warn("ViewSettings.animate", viewSettings.animate);
                    viewSettings.animate = false;
                    console.warn("ViewSettings.animate", viewSettings.animate);
                    //console.warn("[ViewManager.showHTML] ViewManager is already processing a showView/showHTML request for the target '" + target + "'. Use ViewManager.clear('" + target + "') to force a showView/showHTML request.", callStack[target]);
                    //deferredHolder.reject();
                    //return deferredHolder.promises;
                }

                if (templateEngine.hasActions()) {
                    //console.info("It's been detected in showHTML that there are unbounded actions in the TemplateEngine! Make sure to call templateEngine.bind() after template is added to DOM. Resetting to remove memory leaks!");
                    //templateEngine.reset(target);
                }

                var html = viewSettings.html;

                callStack[target].push(1);

                var onAttached = function() {

                    //setTimeout(function() {

                    var triggerOptions = {
                        oldHTML: null,
                        newHTML: html
                    };
                    $(this).trigger("global.html.attached", [triggerOptions]);

                    deferredHolder.attachedDeferred.resolve(html);

                    // In case user forgot to bind. TODO this call could be slow if DOM is large, so make autobind configurable
                    if (templateEngine.hasActions()) {
                        //console.info("autobinding template actions since templateEngine has unbounded actions!");
                        //templateEngine.bind(target);
                    }
                    //});
                };

                var onVisible = function() {

                    //setTimeout(function() {
                    var triggerOptions = {
                        oldHTML: null,
                        newHTML: html
                    };
                    $(this).trigger("global.html.visible", [triggerOptions]);

                    deferredHolder.visibleDeferred.resolve(html);
                    //});
                };

                viewSettings.onAttached = onAttached;
                viewSettings.onVisible = onVisible;
                viewSettings.viewAttached = that.viewAttached;
                viewSettings.viewVisible = that.viewVisible;
                if (viewSettings.animate) {
                    that.commonAttachViewWithAnim(html, viewSettings);
                } else {
                    that.commonAttachView(html, viewSettings);
                }
            });

            return deferredHolder.promises;
        };

        this.commonAttachView = function(html, viewSettings) {
            var target = viewSettings.target;
            var $target = $(target);
            if ($target.length === 0) {
                throw new Error("The showView/showHTML target '" + target + "' does not exist in the DOM!");
            }
            if (viewSettings.view != null) {
                var currentView = viewSettings.previousView;
                var isMainViewReplaced = target === settings.target;
                var triggerOptions = {
                    oldView: currentView,
                    newView: viewSettings.view,
                    isMainView: isMainViewReplaced,
                    viewSettings: viewSettings
                };
                $(that).trigger("global.before.attach", [triggerOptions]);
                $(that).trigger("global.before.remove", [triggerOptions]);
            }
            settings.attachHandler(html, viewSettings);
        };

        this.attachView = function(html, viewSettings) {
            var target = viewSettings.target;
            var $target = $(target);
            var viewAttached = viewSettings.viewAttached;
            var viewVisible = viewSettings.viewVisible;
            $target.empty();
            $target.html(html);
            viewAttached(viewSettings);
            viewVisible(viewSettings);
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
                if (options.bindTemplate === false) {
                    //console.info("When rendering the target '" + target + "' it was detected that templateEngine had unbounded Actions. " +
                    //"Remember to call templateEngine.bind(target) otherwise your actions rendered with Handlebars won't fire!");
                    return;
                }
                // TODO should we auto bind at all?? Simply warn the user?

                var total = -1;
                if (typeof performance !== 'undefined') {
                    var t0 = performance.now();
                    templateEngine.bind(target);
                    var t1 = performance.now();
                    total = (t1 - t0);
                    total = total.toFixed(2);
                    var threshold = 20; // millis
                    if (total > threshold) {
                        //console.warn("Binding the template actions took" + total + " milliseconds. You can optimize TemplateEngine.bind time by" +
                        //      " manually binding on a specific target eg. templateEngine.bind('#myTable'). This ensures the whole DOM in the target, '" +
                        //     target + "', is not scanned for actions to bind. ");
                    }

                } else {
                    templateEngine.bind(target);
                }

                //console.info("autobinding template actions since templateEngine has unbounded actions. Binding actions of target '" + target
                //      + "' took " + total + " milliseconds");

            } else {
                //console.info("really no actions")
            }
        };
        this.viewVisible = function(viewSettings) {

            var target = viewSettings.target;
            var view = viewSettings.view;

            var onVisible = viewSettings.onVisible;
            if (onVisible) {
                onVisible();
            }

            if (!viewSettings.deferredHolder) {
                throw new Error("options.deferredHolder is required!");
            }
            var mainDeferred = viewSettings.deferredHolder.mainDeferred;
            if (mainDeferred) {
                mainDeferred.resolve(view);
            }

            that.clear(target);
            removeGlobalErrorHandler(target);

            if (typeof callStack[target] !== 'undefined') {
                /*
                 if (callStack[target].length >= 1) {
                 var next = callStack[target][0];
                 //console.error("show common", next.viewSettings.view);
                 that.resolveViewAndShow(next.viewSettings.view, next.deferredHolder, next.viewSettings);
                 }
                 */
            } else {
                //console.warn("FX.off false");
                $.fx.off = false;
            }
        };

        this.commonAttachViewWithAnim = function(html, viewSettings) {

            var target = viewSettings.target;
            var $target = $(target);
            if ($target.length === 0) {
                throw new Error("The showView()/showHTML() target '" + target + "' does not exist in the DOM!");
            }
            if (viewSettings.view != null) {
                var currentView = viewSettings.previousView;
                var isMainViewReplaced = target === settings.target;
                var triggerOptions = {
                    oldView: currentView,
                    newView: viewSettings.view,
                    isMainView: isMainViewReplaced,
                    viewSettings: viewSettings
                };
                $(that).trigger("global.before.attach", [triggerOptions]);
                $(that).trigger("global.before.remove", [triggerOptions]);
            }
            //$target.css({'opacity': 0});
            //$target.hide();

            settings.animateHandler(html, viewSettings);
        };

        this.attachViewWithAnim = function(html, viewSettings) {
            var target = viewSettings.target;
            var $target = $(target);
            var viewAttached = viewSettings.viewAttached;
            var viewVisible = viewSettings.viewVisible;
            $target.fadeOut('fast', function() {

                $target.empty();
                $target.html(html);
                viewAttached(viewSettings);

                $target.fadeIn({queue: false, duration: 'fast', complete: function() {
                        viewVisible(viewSettings);
                    }});

                //$target.animate({rotateY: "rotateY(10deg)"}, {queue: false, duration: 'fast', complete: function() {
                //alert("o");
                // }});

            });
        };

        this.updateHistory = function() {
            processHashChange = false;
            $.spamd.history.update();
            processHashChange = true;
        };

        this.empty = function(target) {
            target = target || settings.target;
            var $target = $(target);
            if ($target.length === 0) {
                throw new Error("The empty() target '" + target + "' does not exist in the DOM!");
            }
            removeCurrentView(target);
            this.clear(target);
            $target.empty();
        };

        this.clear = function(target) {
            target = target || settings.target;
            var obj = callStack[target];
            if (obj) {
                //obj.pop();
                obj.splice(0, 1);
                if (obj.length === 0) {
                    delete callStack[target];
                }
            }
        };

        this.hasCurrentViews = function() {
            var isEmpty = $.isEmptyObject(currentViews);
            return !isEmpty;
        };

        this.getCurrentViews = function() {
            return currentViews;
        };

        this.getCurrentView = function(target) {
            target = target || settings.target;
            var currentView = currentViews[target];
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
                    + "This sometimes occur because RequireJS loading order is incorrect eg. the file initializing ViewManager is loaded *after* the file using ViewManager!");
        };

        function setCurrentView(newView, viewSettings) {
            var target = viewSettings.target;
            var previousView = that.getCurrentView(target);

            // remove current view at the target
            removeCurrentView(target);

            // add new view
            var currentView = {view: newView, options: viewSettings};
            currentViews[target] = currentView;
            return previousView;
        }
        /*
         function removeCurrentView(target) {
         var currentView = currentViews[target];
         if (currentView == null) {
         return;
         }
         onDestroyCurrentView(currentView);
         delete currentViews[target];
         }
         */
        function removeCurrentView(target) {
            $.each(currentViews, function(currentViewTarget, currentView) {

                // fast path - if targets match, remove associated view
                if (target === currentViewTarget) {
                    onDestroyCurrentView(currentView);
                    delete currentViews[currentViewTarget];

                } else {
                    // slow path, check if currentView is contained inside target
                    var targetContainsView = $(currentViewTarget).closest(target).length > 0;
                    if (targetContainsView) {
                        onDestroyCurrentView(currentView);
                        delete currentViews[currentViewTarget];
                    }
                }
            });
        }

        function onDestroyCurrentView(currentView) {
            if (currentView == null) {
                return;
            }
            // TODO: we don't know whether the DOM for the overwritten view was added or not. Need to add another status to determine if it
            // is safe to call onDestroy
            if (currentView.options.overwritten) {
                return;
            }

            if (currentView.view && currentView.view.onDestroy) {

                currentView.view.onDestroy(currentView.options);
            }
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
