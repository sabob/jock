// Place third party dependencies in the lib folder
//
// Configure loading modules from the lib directory,
// except 'app' ones, 
requirejs.config({
    "baseUrl": "lib",
    "paths": {
      "app": "../app",
        "moment": "moment",
        "numeral": "numeral"
               
    },
    "shim": {
        //"jquery.deserialize": ["jquery"],
        "handlebars": { exports: "Handlebars"}
        //"jquery.address": { exports: "address"}
    }
});

// Load the main app module to start the app
console.log("Loading main!@");
requirejs(['kv/onResourceLoad', "app/main"]);
//requirejs([ "app/main"]);
