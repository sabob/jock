// 
// // Place third party dependencies in the lib folder
//
// Configure loading modules from the lib directory,
// except 'app' ones, 
requirejs.config({
    "baseUrl": "js/lib", // root folder where all our libraries are located
    "paths": {
        "app": "../app", // path to our application
        "hb": "spamd/hb", // set path to the AMD Handlebars plugin for compiling templates when they are loaded
        "moment": "moment",
        "numeral": "numeral",
        tweenmax:  'greensock/TweenMax'
    },
    "shim": {
        "handlebars": {exports: "Handlebars"},
        "tweenmax": {
            exports: 'TweenMax'
    }
    }
});

// onResourceLoad is a requirejs extension to manipulate modules being loaded.
// Here we add a the module ID (which is also the path to the module location)
// as an attribute on the module itself
requirejs.onResourceLoad = function(context, map, depArray) {
    var obj = context.defined[map.name];

    if (obj) {
        if (obj.prototype) {
            if (!obj.prototype.id) {
                obj.prototype.id = map.id;
                obj.id = map.id;
            }
        } else {
            if (!obj.id) {
                obj.id = map.id;
            }
        }
    }
};
/*
    requirejs.onError = function (err) {
    if (err.requireType === 'timeout') {
        // tell user
        alert("error: "+err);
    } else {
        throw err;
    }
};*/

var GreenSockAMDPath = "greensock";
// Load the main app module to start the app
requirejs(["app/main"]);
