// Events order
//    RACTIVE  -> CTRL       => GLOBAL EVENT
//			   ->            => viewBeforeInit
//			   -> onInit     => viewInit
//   render    -> onRender   => viewRender
//   complete  -> onComplete => viewComplete
//             -> onRemove
//                           => viewBeforeUnrender
//   unrender  -> onUnrender => viewUnrender
//   teardown
//   
//   -----
// viewFail - should this event be supported?

define(function (require) {

	var router = require("./router");
	var $ = require("jquery");
	var Ractive = require("ractive");
	var ajaxTrackerFn = require("./utils/ajaxTracker");
	var simpleAjaxTrackerFn = require("./utils/simpleAjaxTracker");
	var onInitHandler = require("./lifecycle/onInitHandler");
	var onRemoveHandler = require("./lifecycle/onRemoveHandler");
	var setupViewEvents = require("./ractive/setupEvents");
	var setupDefaultViewEvents = require("./ractive/setupDefaultEvents");
	var introFn = require("./transition/intro");
	var outroFn = require("./transition/outro");
	var createView = require("./ractive/create");
	var renderView = require("./ractive/render");
	var unrenderView = require("./ractive/unrender");
	var severity = require("./utils/severity");

	function spar() {

		var that = {};

		// 
		var reenableAnimationTracker = {enable: true};

		var routes;

		var routesByPath;

		var currentMVC = {
			view: null,
			ctrl: null,
			requestTracker: {active: true},
			options: null
		};

		var callstack = [];

		var initOptions = null;

		var viewFactory = null;

		var ajaxTracker = ajaxTrackerFn(that);

		that.init = function (options) {
			initOptions = options;
			viewFactory = options.viewFactory;
			routes = initOptions.routes || {};
			routesByPath = {};
			setupRoutesByPaths(routes);
			router.registerRoutes(routes);

			for (var prop in routes) {
				routesByPath[routes[prop]] = prop;
			}

			router.on('routeload', function (routeOptions) {
				that.routeLoaded(routeOptions);
			});

			setupDefaultViewEvents(options);

			router.init({
				unknownRouteResolver: options.unknownRouteResolver
			});
		};

		that.route = function (options) {
			router.go(options);
		};

		that.registerRoute = function (route) {
			routes[route.path] = route.moduleId;
			that.registerRouteByPath(route);
		};

		that.registerRouteByPath = function (route) {
			routesByPath[route.moduleId] = route.path;
		};
		
		that.getDefaultTarget = function () {
			return initOptions.target;
		};

		that.getRoutes = function () {
			return routes;
		};

		that.getRoutesByPath = function () {
			return routesByPath;
		};

		that.routeLoaded = function (options) {

			try {
				callstack.push(1);

				options.target = options.target || initOptions.target;
				options.routeParams = options.routeParams || {};
				options.args = options.args || {};
				options.ajaxTracker = simpleAjaxTrackerFn.create(ajaxTracker, options);

				//options.requestTracker = currentMVC.requestTracker;
				options.mvc = $.extend({}, currentMVC);

				// cancel and cleanup current view request (if there is one)
				cancelCurrentRequest(options);

				// Create a requestTracker for the new view
				var requestTracker = {active: true};
				currentMVC.requestTracker = requestTracker;
				options.mvc.requestTracker = requestTracker;

				// Disable transitions if view requests overwrite one another, eg when another view request is being processed still
				if (callstack.length > 1) {
					$.fx.off = true;
					$(options.target).stop(true, true);
					reenableAnimationTracker.enable = false;
				}

				var ctrl = that.createController(options.module);
				options.ctrl = ctrl;
				delete options.module;
				//options.requestTracker = currentMVC.requestTracker;

				if (currentMVC.ctrl == null) {
					// No view rendered so skip removing the current view and just init the new view
					processOnInit(options).then(function () {

					}, function () {
						// processOnInit failed
						cancelCurrentRequest(options);

						var arg1 = arguments[0];
						if (arg1 != null && arg1.level < severity.ERROR) {
						} else {
							//TODO should viewFailed be called like this with args: var args = Array.slice.call( arguments );
							viewFailed(options, arguments);
						}
					});

				} else {

					processOnRemove(options).then(function () {
						processOnInit(options).then(function () {

						}, function () {
							// processOnInit failed
							cancelCurrentRequest(options);

							var arg1 = arguments[0];
							if (arg1 != null && arg1.level < severity.ERROR) {
							} else {
								//TODO should viewFailed be called like this with args: var args = Array.slice.call( arguments );
								viewFailed(options, arguments);
							}
						});
					}, function () {
						// processOnRemove failed
						cancelCurrentRequest(options);
						viewFailed(options, arguments);
					});
				}

			} catch (e) {
				viewFailed(options, [e]);
			}
		};

		that.createController = function (Module) {
			if (Module instanceof Function) {
				// Instantiate new view
				var result = new Module();
				if (result.id == null) {
					setId(result, Module.id);
				}
				return result;

			} else {
				// Module is not a Function, so assume it is an object and thus already instantiated
				return Module;
			}
		};

		that.processNewView = function (options) {
			var deferred = $.Deferred();
			var promise = deferred.promise();

			setupViewEvents(options);

			that.renderViewWithAnimation(options).then(function () {
				that.callViewEvent("onComplete", options);
				that.triggerEvent("viewComplete", options);
				deferred.resolve(options.view);

			}, function (error, view) {
				//viewFailed(options, [error]);
				// render Ractive rejeced
				//deferred.reject(error);
				deferred.reject(error, view);
			});

			// Request could have been overwritten by new request. Ensure this is still the active request
			if (!options.mvc.requestTracker.active) {
				deferred.reject("Request overwritten by another view request");
			}

			return promise;
		};

		that.callViewEvent = function (eventName, options) {

			var ctrl = options.ctrl;
			if (typeof ctrl[eventName] == 'function') {
				var viewOptions = {
					routeParams: options.routeParams,
					args: options.args,
					view: options.view,
					ajaxTracker: options.ajaxTracker
				};
				ctrl[eventName](viewOptions);
			}
		};

		that.triggerEvent = function (eventName, options) {
			options = options || {};
			options.mvc = options.mvc || {};

			var isMainCtrlReplaced = initOptions.target === options.target;

			// If no controller has been defined, create a dummy one to pass to the event
			var ctrl = options.ctrl;
			if (ctrl == null) {
				ctrl = {};
			}

			var triggerOptions = {
				//oldCtrl: currentMVC.ctrl,
				oldCtrl: options.mvc.ctrl,
				newCtrl: ctrl,
				isMainCtrl: isMainCtrlReplaced,
				ctrlOptions: options,
				eventName: eventName,
				error: options.error
			};

			$(that).trigger(eventName, [triggerOptions]);
		};

		function processOnInit(options) {
			var deferred = $.Deferred();
			var promise = deferred.promise();

			var onInitOptions = {
				ctrl: options.ctrl,
				routeParams: options.routeParams,
				args: options.args,
				mvc: options.mvc,
				ajaxTracker: options.ajaxTracker,
				target: options.target
			};

			that.triggerEvent("viewBeforeInit", options);

			onInitHandler(onInitOptions).then(function (viewOrPromise) {

				options.viewOrPromise = viewOrPromise;
				that.createView(options).then(function (view) {

					options.view = view;
					options.spar = that;
					that.triggerEvent("viewInit", options);

					that.processNewView(options).then(function (view) {

						onInitComplete();
						deferred.resolve();

					}, function () {
						// processNewView rejected
						onInitComplete();
						deferred.reject.apply(deferred, arguments);
					});

				}, function () {
					// view creation rejected
					onInitComplete();
					deferred.reject.apply(deferred, arguments);
					//deferred.reject(arguments);
				});

			}, function () {
				// onInitHandler rejected

				onInitComplete();
				deferred.reject.apply(deferred, arguments);
			});

			return promise;
		}

		function processOnRemove(options) {
			var deferred = $.Deferred();
			var promise = deferred.promise();

			var onRemoveOptions = {
				ctrl: currentMVC.ctrl,
				view: currentMVC.view,
				routeParams: currentMVC.options.routeParams,
				args: currentMVC.options.args,
				//requestTracker: currentMVC.requestTracker,
				mvc: options.mvc,
				ajaxTracker: currentMVC.options.ajaxTracker,
				target: currentMVC.options.target
						//spar: that
			};

			onRemoveHandler(onRemoveOptions).then(function () {

				that.triggerEvent("viewBeforeUnrender", options);

				deferred.resolve();

			}, function () {
				// ctrl.onRemove failed or cancelled
				//options.view.transitionsEnabled = true;

				if (currentMVC.view != null) {
					currentMVC.view.transitionsEnabled = true;
				}
				deferred.reject.apply(deferred, arguments);
			});

			return promise;
		}

		that.renderViewWithAnimation = function (options) {
			var deferred = $.Deferred();
			var promise = deferred.promise();

			var outroOptions = {
				duration: 100,
				target: options.target,
				outro: initOptions.outro
			};
			var introOptions = {
				duration: 'fast',
				target: options.target,
				intro: initOptions.intro
			};
			if (currentMVC.ctrl == null) {
				outroOptions.firstView = introOptions.firstView = true;
				outroOptions.duration = 0;
			}

			outroFn(outroOptions).then(function () {
				if (!options.mvc.requestTracker.active) {
					deferred.reject("Request overwritten by another view request");
					return;
				}

				that.unrenderView(options).then(function () {

					that.renderView(options).then(function () {

						introFn(introOptions).then(function () {
							deferred.resolve(options.view);
						});

					}, function (error, view) {
						// render Ractive rejeced
						deferred.reject(error, view);
					});

				}, function (error, view) {
					deferred.reject(error, view);
				});
			});

			return promise;
		};

		that.createView = function (options) {

			var promise;
			if (viewFactory != null && viewFactory.createView) {
				var promise = viewFactory.createView(options);
			} else {
				promise = createView(options);
			}
			return promise;
		};

		that.renderView = function (options) {
			var deferred = $.Deferred();
			var promise = deferred.promise();

			//options.view.transitionsEnabled = false;

			var renderPromise;
			if (viewFactory != null && viewFactory.renderView) {
				renderPromise = viewFactory.renderView(options);
			} else {
				renderPromise = renderView(options);
			}

			renderPromise.then(function () {

				// Store new controller and view on currentMVC
				that.updateMVC(options);

				//options.view.transitionsEnabled = true;

				// Seems that Ractive render swallows errors so here we catch and log errors thrown by the viewRender event
				try {
					that.callViewEvent("onRender", options);
					that.triggerEvent("viewRender", options);
				} catch (error) {
					deferred.reject(error, options.view);
					return;
				}

				deferred.resolve(options.view);

			}, function (error) {
				deferred.reject(error, options.view);
			});

			return promise;
		};

		that.unrenderView = function (options) {
			var deferred = $.Deferred();
			var promise = deferred.promise();

			if (options.mvc.view == null) {
				// No view to unrender
				deferred.resolve();

			} else {

				//options.mvc.view.transitionsEnabled = false;
				var promise;
				if (viewFactory != null && viewFactory.unrenderView) {
					var promise = viewFactory.unrenderView(options);
				} else {
					promise = unrenderView(options);
				}

				promise.then(function () {
					//options.mvc.view.unrender().then(function () {

					// Seems that Ractive unrender swallows errors so here we catch and log errors thrown by the viewUnrender event
					try {
						that.callViewEvent("onUnrender", options);
						that.triggerEvent("viewUnrender", options);
					} catch (error) {
						deferred.reject(error, options.view);
						return;
					}

					if (!options.mvc.requestTracker.active) {
						deferred.reject("Request overwritten by another view request", options.mvc.view);
						return;
					}

					deferred.resolve(options.mvc.view);

				}, function () {

					deferred.reject(options.mvc.view);

				});
			}

			return promise;
		};

		that.updateMVC = function (options) {
			currentMVC.view = options.view;
			currentMVC.ctrl = options.ctrl;
			currentMVC.options = options;
		};

		function onInitComplete() {
			callstack.splice(0, 1);
			if (callstack.length === 0) {
				console.log("AT 0");

				// Delay switching on animation incase user is still clicking furiously
				reenableAnimationTracker.enable = false;
				reenableAnimationTracker = {enable: true};
				reenableAnimations(reenableAnimationTracker);
			} else {
				console.log("AT ", callstack.length);
			}
		}

		function reenableAnimations(reenableAnimationTracker) {
			// We wait a bit before enabling animations in case user is still thrashing UI.
			setTimeout(function () {
				if (reenableAnimationTracker.enable) {
					$.fx.off = false;
				}
			}, 350);
		}

		function setupRoutesByPaths(routes) {
			for (var key in routes) {
				if (routes.hasOwnProperty(key)) {
					var route = routes[key];
					that.registerRouteByPath(route);
				}
			}
		}

		function viewFailed(options, errorArray) {
			var errors = errorArray;
			if (!$.isArray(errorArray)) {
				errors = Array.prototype.slice.call(errorArray);
			}
			options.error = errors;
			that.triggerEvent("viewFail", options);
		}

		function cancelCurrentRequest(options) {

			// Check if request has already been overwritten
			if (options.mvc.requestTracker.active === false) {
				return;
			}

			// current controller has been overwritten by new request
			options.mvc.requestTracker.active = false;

			ajaxTracker.abort(options.target);
			ajaxTracker.clear(options.target);

		}

		function setId(obj, id) {
			// Create an ID property which isn't writable or iteratable through for in loops.
			if (!obj.id) {
				Object.defineProperty(obj, "id", {
					enumerable: false,
					writable: false,
					value: id
				});
			}
		}

		return that;
	}

	var result = spar();
	return result;
});
