# Welcome to Spar

Spar is a micro MVC framework centered around AMD module loading and Ractive template binding.

Spar provides a router to map between URLs and controllers. Controller are essentially AMD modules with a well defined life-cycle consisting
of an "initialization" phase, "rendering" phase and finally a "remove" phase. AMD modules can partake in these phases by implementing the
appropriate method such as "onInit", "onRender", "onRemove" etc.

Each controller has an associated View template which is bound to the controller. The View and binding is handled by a Ractive instance.

Spar
----

The Spar module is a facade for the framework and most interaction with the framework is handled by the Spar module.

A new Spar instance is initialized by passing in a "target", an element ID where views will be rendered, and a "route" object 
which specifies which URLs map to which Controller.

    var spar = require("spar");

// Import some controllers
var homeCtrl = require("homeCtrl");
var personCtrl = require("personCtrl");
var notFoundCtrl = require("notFoundCtrl");

    var options = {};

    // Specify the routes
    var routes = {
        home: {path: 'home', moduleId: homeCtrl.id}
        person: {path: 'person', moduleId: personCtrl.id}
        notFound: {path: '*', moduleId: notFound.id}
    };
    options.routes = routes;

// Initialize spar with the given routes and a target css ID where the views will be rendered to
    spar.init({
        target: "#container",
        routes: routes
});

Controller
----------
Controllers are AMD modules that must implement an "onInit" function which returns a Ractive View instance or a Promise which resolves
to a Ractive View instance.

Example controller:

    define(function (require) {

        var template = require("rvc!./home");
	
        function homeCtrl() {
		
            var that = {};

            that.onInit = function(options) {
            
                var view = new template();
                return view;
            }
		
            return that;
        }
        return homeCtrl;
    });

In the home controller above the onInit function is implemented. onInit receives an "options" object and must return the view.

In Spar the views are Ractive instances, consisting of an HTML template and data. Ractive binds the HTML template and data to form the view.

The onInit function of a controller must return a Ractive instance or a promise which resolves to a Ractive instance.

The Ractive HTML template is imported as an AMD module through the "rvc" plugin. This plugin transforms an HTML Ractive template by compiling
it to a Ractive function ready to be instantiated.


onInit
------

Controllers in spar must implement an onInit method. onInit must return a Ractive view instance or function (spar will instantiate it if needed)
or a promise which resolves to a Ractive view instance or function.

onInit options
--------------

The following options are passed to the onInit method:

options = {
  ajaxTracker: provides a means of registering ajax calls in the controller. Ajax calls tracked this way will automatically abort when the view
is removed. ajaxTracker also provides a way to listen to ajax lifecycle events such as ajax.start / ajax.stop etc.

routeParams: all URL parameters (including segment parameters and query parameters) are passed to the controller through the routeParams object.
args: arguments passed to the controller from another controller. args can only be passed to a view when called from a controller, not when navigating via the URL hash
}


onRemove
--------

Controllers can optionally implement the onRemove method. This method controls whether the view can be removed or not. onRemove must return
either true or false or a promise that resolves to true or false.
If onRemove returns true, the view will be removed. If false, the request will be cancelled and the view will not be removed.

onRemove options
----------------


Gobal events
------------

You can subscribe to global events fired by spar as follows:

var spar = require("spar/spar");
$(spar).on('viewInit', function (e, options) {
    // called whenever a view has been initialized
	});
	
The following global events exist:
viewBeforeInit     : called before the controller.onInit method is called
viewInit           : called after the controller.onInit method is called
viewRender         : called after the controller's Ractive view has been added to the DOM
viewComplete       : called after the controller's Ractive view has been rendered and completed any transitions
viewBeforeUnrender : called before view is removed from the dom. this event only occurs if the Controller.onRemove method returns true
viewUnrender       : called after the controller's Ractive view has been removed from the DOM

Global event options
--------------------
The following options are passed to the events:

options = {
    oldCtrl     : old controller which is being removed
    newCtrl     : new controller being added
    isMainCtrl  : (experimental) true if the new controller replaces the main view eg the target specified in Spar initialization is replaced. If false
                  it means the new controller is a sub view on another controller
    ctrlOptions : all the options used for the new controller
		eventName   : name of the event which fired
		error       : optionally specifies the error / errors which lead to the event being triggered   
}

The following events exist on a controller:
onInit     : the initialization event which must be implemented by each controller
onRender   : called after the view has been added to the DOM
onComplete : called after the view has been added to the DOM AND once all transitions has completed.
onRemove   : called before removing the controller
onUnrender : called after the view has been removed from the DOM

Example:
--------

define(function (require) {

        var template = require("rvc!./home");
	
        function homeCtrl() {
		
            var that = {};

            that.onInit = function(options) {
            
                var view = new template();
                return view;
            }

            that.onRender = function(options) {
                // View has been added to the DOM
            }

            that.onComplete = function(options) {
                // view has been added to the DOM and transitions completed
            }
		
            return that;
        }
        return homeCtrl;
    });

Routing
-------

The following routing logic is supported:

* Segment parameters are specified as a colon with a name eg: /person:id
The following url will match this route:
/person/1

* Query parameters are specified as ampersand separated values after the questionmark eg: /person?id&name
The following url will match this route:
/person?id=1&name=bob

* Wildcardsare specified as an asterisk eg: /view/*/person
The following url will match this route:
/view/anything/person
