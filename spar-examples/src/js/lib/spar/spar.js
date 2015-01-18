// Events
//   ctrlChange
//   viewBeforeRemove
//   viewAfterRemove
//   teardown
//   render
//   complete

define(function (require) {

	var router = require("./router");
	var $ = require("jquery");
	var onInitHandler = require("./lifecycle/onInitHandler");
	var onRemoveHandler = require("./lifecycle/onRemoveHandler");
	var setupRactiveEvents = require("./ractive/setupEvents");
	var setupDefaultRactiveEvents = require("./ractive/setupDefaultEvents");
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

		that.init = function (options) {
			initOptions = options;
			routes = initOptions.routes || {};
			routesByPath = {};
			setupRoutesToPaths(routes);
			router.registerRoutes(routes);

			for (var prop in routes) {
				routesByPath[routes[prop]] = prop;
			}

			router.on('routeload', function (routeOptions) {
				//console.log("route loaded", routeOptions.ctrl.id);
				that.routeLoaded(routeOptions);
			});

			setupDefaultRactiveEvents(options);

			router.init();
		};

		function setupRoutesToPaths(routes) {
			for (var route in routes) {
				if (routes.hasOwnProperty(route)) {
					var r = routes[route];
					routesByPath[r.moduleId] = r.path;
				}
			}
		}

		that.getRoutes = function () {
			return routes;
		};

		that.getRoutesByPath = function () {
			return routesByPath;
		}

		that.routeLoaded = function (options) {

			callstack.push(1);

			options.target = options.target || initOptions.target;

			// current controller has been overwritten by new request
			currentMVC.requestTracker.active = false;

			// We enable transitions by default for the new view
			if (callstack.length > 1) {
				$.fx.off = true;
				$(initOptions.target).stop(true, true);
				enableAnimationsTracker.enableAnimation = false;
			}

			var requestTracker = {active: true};
			currentMVC.requestTracker = requestTracker;

			var ctrl = that.createController(options.ctrl);
			options.ctrl = ctrl;

			that.triggerEvent("ctrlChange", ctrl, options);

			var onInitOptions = {
				ctrl: ctrl,
				routeParams: options.params,
				requestTracker: requestTracker,
				spar: that
			};

			onInitHandler(onInitOptions).then(function () {

				onInitComplete();
			}, function () {

				onInitComplete();
			});
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

		that.processRactive = function (options) {
			//options.view.transitionsEnabled = options.transitionsEnabled;

			var deferred = $.Deferred();
			var promise = deferred.promise();

			setupRactiveEvents(options);

			if (currentMVC.ctrl == null) {
				// No view to remove so we insert ractive view into DOM
				options.view.transitionsEnabled = false;
				
				$(initOptions.target).empty();
				options.view.render(initOptions.target).then(function () {
					$(initOptions.target).fadeIn(0, function () {
						options.view.transitionsEnabled = true;

						currentMVC.view = options.view;
						currentMVC.ctrl = options.ctrl;
						deferred.resolve(options.view);
					});
				});

			} else {

				if (!options.requestTracker.active) {
					// TODO now sure if this code is useful here
					deferred.reject();
					return promise;
				}

				var onRemoveOptions = {
					ctrl: currentMVC.ctrl,
					view: currentMVC.view,
					routeParams: options.params,
					requestTracker: currentMVC.requestTracker,
					spar: that
					//transitionsEnabled: currentMVC.view.transitionsEnabled
				};

				onRemoveHandler(onRemoveOptions).then(function () {
					console.log("Fragment rendered", currentMVC.view.fragment.rendered);

					$(initOptions.target).fadeOut('slow', function () {

						if (!options.requestTracker.active) {
							deferred.reject();
							return;
						}

						currentMVC.view.transitionsEnabled = false;
						console.error("RENDERED", currentMVC.view.fragment.rendered);
						currentMVC.view.unrender().then(function () {
							if (!options.requestTracker.active) {
								deferred.reject();
								return;
							}

							options.view.transitionsEnabled = false;
							options.view.render(initOptions.target).then(function () {
								//console.log("DONE RENDER")

								currentMVC.view = options.view;
								currentMVC.ctrl = options.ctrl;
								currentMVC.view.transitionsEnabled = true;

								$(initOptions.target).fadeIn('slow', function () {
									deferred.resolve(options.view);

								});
							});
						});
					});

				}, function () {
					// OnRemove failed or cancelled
					options.view.transitionsEnabled = true;
					currentMVC.view.transitionsEnabled = true;
					deferred.reject();
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
			
			setTimeout(function () {
				if (tracker.enableAnimation) {
					$.fx.off = false;
				}
			}, 150);
		}

		return that;
	}

	var result = spar();
	//console.log("RES", result)
	return result;
});
