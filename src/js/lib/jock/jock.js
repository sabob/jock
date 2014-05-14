define(function(require) {
    console.log("Jock start");
    //require('jock/onResourceLoad');
    var $ = require("jquery");
    $.ajaxSetup({traditional: true});
//requirejs(["jquery.history"]);
//requirejs(["history.adapter.jquery"]);
//requirejs(["jsuri"]);
    require("jock/utils/string");
    require("jock/utils/url");
    require("jock/utils/utils");
    require("jock/utils/error-utils");

    //console.log("URL NOW RDY");

    require("jquery.deparam");
    require("jquery.deserialize");

    console.log("Jock end");

// Place third party dependencies in the lib folder
//
// Configure loading modules from the lib directory,
// except 'app' ones, 

    /*
     requirejs.config({
     //"baseUrl": "lib",
     "paths": {
     //"app": "../app",
     "hb": "jock/hb",
     "moment": "moment",
     "numeral": "numeral"
     },
     "shim": {
     "handlebars": {exports: "Handlebars"}
     //"jquery.address": { exports: "address"}
     }
     });*/


// Load the main app module to start the app
//console.log("Loading Jock");
//requirejs([ "app/main"]);

});