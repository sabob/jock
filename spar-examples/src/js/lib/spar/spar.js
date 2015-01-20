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
	var ajaxTrackerFn = require("./utils/ajax-tracker");
	var onInitHandler = require("./lifecycle/onInitHandler");
	var onRemoveHandler = require("./lifecycle/onRemoveHandler");
	var setupViewEvents = require("./ractive/setupEvents");
	var setupDefaultViewEvents = require("./ractive/setupDefaultEvents");
	//var createRactive = require("./ractive/create");

	function spar() {

		var that = {};

		var enableAnimationsTracker = {enableAnimation: true};

		var routes;

		var routesByPath;

		var currentMVC = {
			view: null,
			ctrl: null,
			requestTracker: {active: true}
		};

		var callstack = [];

		var initOptions = null;

		var ajaxTracker = ajaxTrackerFn(that);

		that.init = function (options) {
			initOptions = options;
			routes = initOptions.routes || {};
			routesByPath = {};
			setupRoutesByPaths(routes);
			router.registerRoutes(routes);

			for (var prop in routes) {
				routesByPath[routes[prop]] = prop;
			}

			router.on('routeload', function (routeOptions) {
				//console.log("route loaded", routeOptions.ctrl.id);
				that.routeLoaded(routeOptions);
			});

			setupDefaultViewEvents(options);

			router.init();
		};

		that.getRoutes = function () {
			return routes;
		};

		that.getRoutesByPath = function () {
			return routesByPath;
		};

		that.routeLoaded = function (options) {

			callstack.push(1);

			options.target = options.target || initOptions.target;

			// cancel and cleanup current view request (if there is one)
			cancelCurrentRequest(options);

			// Disable transitions if view requests overwrite one another, eg when another view request is being processed still
			if (callstack.length > 1) {
				$.fx.off = true;
				$(initOptions.target).stop(true, true);
				enableAnimationsTracker.enableAnimation = false;
			}

			var ctrl = that.createController(options.ctrl);
			options.ctrl = ctrl;
			options.requestTracker = currentMVC.requestTracker;

			if (currentMVC.ctrl == null) {
				// No view rendered so skip removing the current view and just init the new view
				processOnInit(options).then(function () {

				}, function () {
					//handleAbortRequest(options);
				});

			} else {

				processOnRemove(options).then(function () {
					processOnInit(options).then(function () {

					}, function () {
						cancelCurrentRequest(options);
					});
				}, function (e) {
					// ctrl.onRemove cancelled
					cancelCurrentRequest(options);
				});
			}
		};

		that.createController = function (Module) {
			if (Module instanceof Function) {
				// Instantiate new view
				var result = new Module();
				if (result.id == null) {
					result.id = Module.id;
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

			if (currentMVC.ctrl == null) {
				// No view to remove so we insert ractive view into DOM
				that.renderRactiveWithAnimation(options).then(function () {
					that.triggerEvent("viewComplete", options.ctrl, options);
					deferred.resolve(options.view);

				}, function (error, view) {
					console.error(error);
					that.triggerEvent("viewFail", options.ctrl, options);
					// render Ractive rejeced
					deferred.reject(options.view);
				});

			} else {

				that.renderRactiveWithAnimation(options).then(function () {
					that.triggerEvent("viewComplete", options.ctrl, options);
					deferred.resolve(options.view);

				}, function (error, view) {
					console.error(error);
					that.triggerEvent("viewFail", options.ctrl, options);
					// render Ractive rejeced
					deferred.reject(options.view);
				});
			}

			// Request could have been overwritten by new request. Ensure this is still the active request
			if (!options.requestTracker.active) {
				deferred.reject();
			}

			return promise;
		};

		that.triggerEvent = function (eventName, ctrl, settings) {
			var isMainCtrlReplaced = initOptions.target === settings.target;

			var triggerOptions = {
				oldCtrl: currentMVC.ctrl,
				newCtrl: ctrl,
				isMainCtrl: isMainCtrlReplaced,
				ctrlOptions: settings,
				event: eventName
			};

			$(that).trigger(eventName, [triggerOptions]);
		};

		function processOnInit(options) {
			var deferred = $.Deferred();
			var promise = deferred.promise();

			var onInitOptions = {
				ctrl: options.ctrl,
				routeParams: options.params,
				requestTracker: currentMVC.requestTracker,
				ajaxTracker: ajaxTracker,
				target: options.target,
				spar: that
			};

			that.triggerEvent("viewBeforeInit", options.ctrl, options);

			onInitHandler(onInitOptions).then(function (view) {
				options.view = view;
				options.spar = that;
				that.triggerEvent("viewInit", options.ctrl, options);

				// Assume it is a Ractive object
				that.processNewView(options).then(function (view) {
					deferred.resolve();
				}, function () {
					deferred.reject();
				});

				onInitComplete();
				deferred.resolve();
			}, function () {

				onInitComplete();
				deferred.reject();
			});

			return promise;
		}

		function processOnRemove(options) {
			var deferred = $.Deferred();
			var promise = deferred.promise();

			var onRemoveOptions = {
				ctrl: currentMVC.ctrl,
				view: currentMVC.view,
				routeParams: options.params,
				requestTracker: currentMVC.requestTracker,
				target: options.target,
				spar: that
			};

			onRemoveHandler(onRemoveOptions).then(function () {

				that.triggerEvent("viewBeforeUnrender", options.ctrl, options);

				deferred.resolve();

			}, function () {
				// ctrl.onRemove failed or cancelled
				//options.view.transitionsEnabled = true;

				if (currentMVC.view != null) {
					currentMVC.view.transitionsEnabled = true;
				}
				deferred.reject();
			});

			return promise;
		}

		that.renderRactiveWithAnimation = function (options) {
			var deferred = $.Deferred();
			var promise = deferred.promise();

			var outroAnimationDuration = 100;
			var intoAnimationDuration = 'fast';
			if (currentMVC.ctrl == null) {
				intoAnimationDuration = 0;
				outroAnimationDuration = 0;
			}

			$(initOptions.target).fadeOut(outroAnimationDuration, function () {

				if (!options.requestTracker.active) {
					deferred.reject();
					return;
				}

				that.unrenderRactive(options).then(function () {

					that.renderRactive(options).then(function () {

						$(initOptions.target).fadeIn(intoAnimationDuration, function () {
							deferred.resolve(options.view);
						});

					}, function (error, view) {
						// render Ractive rejeced
						deferred.reject(error, options.view);
					});

				}, function (error, view) {
					deferred.reject(error, view);
				});
			});

			return promise;
		};

		that.renderRactive = function (options) {
			var deferred = $.Deferred();
			var promise = deferred.promise();

			options.view.transitionsEnabled = false;

			options.view.render(initOptions.target).then(function () {

				currentMVC.view = options.view;
				currentMVC.ctrl = options.ctrl;
				currentMVC.view.transitionsEnabled = true;

				that.triggerEvent("viewRender", options.ctrl, options);

				deferred.resolve(options.view);

			}, function (error) {
				deferred.reject(error, options.view);
			});

			return promise;
		};

		that.unrenderRactive = function (options) {
			var deferred = $.Deferred();
			var promise = deferred.promise();

			if (currentMVC.view == null) {
				// No view to unrender
				deferred.resolve();

			} else {

				currentMVC.view.transitionsEnabled = false;
				currentMVC.view.unrender().then(function () {

					that.triggerEvent("viewUnrender", options.ctrl, options);

					if (!options.requestTracker.active) {
						deferred.reject(currentMVC.view);
						return;
					}

					deferred.resolve(currentMVC.view);

				}, function () {

					deferred.reject(currentMVC.view);

				});
			}

			return promise;
		};

		function onInitComplete() {
			callstack.splice(0, 1);
			if (callstack.length === 0) {
				console.log("AT 0");

				// Delay switching on animation incase user is still clicking furiously
				enableAnimationsTracker.enableAnimation = false;
				enableAnimationsTracker = {enableAnimation: true};
				enableAnimations(enableAnimationsTracker);
			} else {
				console.log("AT ", callstack.length);
			}
		}

		function enableAnimations(tracker) {
			// We wait a bit before enabling animations in case user is still thrashing UI.
			setTimeout(function () {
				if (tracker.enableAnimation) {
					$.fx.off = false;
				}
			}, 350);
		}

		function setupRoutesByPaths(routes) {
			for (var key in routes) {
				if (routes.hasOwnProperty(key)) {
					var route = routes[key];
					routesByPath[route.moduleId] = route.path;
				}
			}
		}

		function cancelCurrentRequest(options) {

			// current controller has been overwritten by new request
			currentMVC.requestTracker.active = false;

			// Create a requestTracker for the new view
			var requestTracker = {active: true};
			currentMVC.requestTracker = requestTracker;

			//console.error("aborted requests", options.target);
			ajaxTracker.abort(options.target);
			ajaxTracker.clear(options.target);
		}

		return that;
	}

	var result = spar();
	return result;
});
