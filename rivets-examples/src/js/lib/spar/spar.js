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
	var rivets = require("rivets");
	var onInitHandler = require("./lifecycle/onInitHandler");
	var onRemoveHandler = require("./lifecycle/onRemoveHandler");
	var setupRivetEvents = require("./ractive/setupEvents");
	var setupDefaultRivetEvents = require("./ractive/setupDefaultEvents");
	//var createRivet = require("./ractive/create");

	function spar() {

		var that = {};

		var globalTransitionsEnabled = true;

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
			
			setupDefaultRivetEvents(options);

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
			var transitionsEnabled = globalTransitionsEnabled;
			if (callstack.length > 1) {

				// If we detect the new view overwriting a previous view, we disable transitions globally
				globalTransitionsEnabled = false;
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
				spar: that,
				transitionsEnabled: transitionsEnabled
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

		that.processRivet = function (options) {
			//options.view.transitionsEnabled = options.transitionsEnabled;

			var deferred = $.Deferred();
			var promise = deferred.promise();

			//setupRivetEvents(options);

			if (currentMVC.ctrl == null) {
				// No view to remove so we insert rivet view into DOM
				//options.view.transitionsEnabled = false;

				/*
				options.view.render(initOptions.target).then(function () {
					deferred.resolve(options.view);
				});*/
				$(initOptions.target).empty();
				$(initOptions.target).html(options.template);
				options.view = rivets.bind($(initOptions.target), options.model);
				currentMVC.view = options.view;
				currentMVC.ctrl = options.ctrl;
			} else {

				if (!options.requestTracker.active) {
					// TODO now sure if this code is useful here
					deferred.reject();
					return promise;
				}

				/*
				 if (!options.requestTracker.active) {
				 deferred.reject();
				 return;
				 }*/

				// Disable the outtro transitions while switching views. This guards against users that quickly navigates between
				// views and forces a new view to be rendered while the previous views is removed and it's outtro transition is still
				// in progress. If Ractive has a feature to stop active transitions, this code can be revisited
				//currentMVC.view.transitionsEnabled = false;
				//currentMVC.view.transitionsEnabled = true;

				var onRemoveOptions = {
					ctrl: currentMVC.ctrl,
					view: currentMVC.view,
					routeParams: options.params,
					requestTracker: currentMVC.requestTracker,
					spar: that,
					transitionsEnabled: currentMVC.view.transitionsEnabled
				};

				onRemoveHandler(onRemoveOptions).then(function () {

					console.warn(currentMVC.view);

					//console.log("Fragment rendered", currentMVC.view.fragment.rendered);
					//debugger;
					//currentMVC.view.unrender().then(function (arg) {
					currentMVC.view.unrender().then(function (arg) {
						///currentMVC.view.detach();
						console.error("UNRENDER COMPLETE");

						if (currentMVC.view.unrenderComplete != null && currentMVC.view.unrenderComplete.length > 0) {
							var ar = currentMVC.view.unrenderComplete;
							var fns = ar.slice(0);
							fns.splice(0, fns.length).forEach(function (fn) {
								//for (var i = 0; i < fns.length; i++) {
								//var fn = fns[i];
								fn();
							});
							currentMVC.view.unrenderComplete = [];
						}

						// Request could have been overwritten by new request. Ensure this is still the active request
						if (!options.requestTracker.active) {
							deferred.reject();
							return promise;
						}

						// Insert ractive into DOM
						console.log("DOK", options.view.fragment.rendered);
						if (options.view.fragment.rendered) { // check to see if this view has been rendered previously
							alert("Bleh")
							options.view.insert(initOptions.target);
							deferred.resolve(options.view);
						} else {
							options.view.render(initOptions.target).then(function () {
								//console.log("DONE RENDER")
								deferred.resolve(options.view);
							});
						}

						//console.log("VIEW VISIBLE");
						currentMVC.view = options.view;
						currentMVC.ctrl = options.ctrl;
					}, function () {
						console.error("TEARDOWN ERROR");
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
				//setTimeout(function() {
				// Let's just wait a bit to see if things calmed down before enabling transitions again
				//if (callstack.length === 0) {
				globalTransitionsEnabled = true;
				//}
				//}, 1350);
			} else {
				console.log("AT ", callstack.length);
			}
		}

		return that;
	}

	var result = spar();
	//console.log("RES", result)
	return result;
});
