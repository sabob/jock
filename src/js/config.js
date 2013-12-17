// 
// // Place third party dependencies in the lib folder
//
// Configure loading modules from the lib directory,
// except 'app' ones, 
requirejs.config({
    "baseUrl": "js/lib",
    "paths": {
        "app": "../app",
        "hb": "spamd/hb",
        "moment": "moment",
        "numeral": "numeral"
    },
    "shim": {
        "handlebars": {exports: "Handlebars"}
    }
});

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

// Load the main app module to start the app
requirejs(["app/main"]);
