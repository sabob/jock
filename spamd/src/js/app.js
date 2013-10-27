// Place third party dependencies in the lib folder
//
// Configure loading modules from the lib directory,
// except 'app' ones, 
requirejs.config({
    "baseUrl": "lib",
    "paths": {
      "app": "../app",
      "hb": "spamd/hb",
        "moment": "moment",
        "numeral": "numeral"
               
    },
    "shim": {
        "handlebars": { exports: "Handlebars"}
    }
});

// Load the main app module to start the app
requirejs(['spamd/onResourceLoad', "app/main"]);
