define(function(require) {
    //console.log("SPAMD start");
    //require('spamd/onResourceLoad');
    var $ = require("jquery");
    $.ajaxSetup({traditional: true});
//requirejs(["jquery.history"]);
//requirejs(["history.adapter.jquery"]);
//requirejs(["jsuri"]);
    require("spamd/utils/string");
    require("spamd/utils/url");
    require("spamd/utils/utils");
    require("spamd/utils/error-utils");

    //console.log("URL NOW RDY");

    require("jquery.deparam");
    require("jquery.deserialize");

    //console.log("SPAMD end");

// Place third party dependencies in the lib folder
//
// Configure loading modules from the lib directory,
// except 'app' ones, 

    /*
     requirejs.config({
     //"baseUrl": "lib",
     "paths": {
     //"app": "../app",
     "hb": "spamd/hb",
     "moment": "moment",
     "numeral": "numeral"
     },
     "shim": {
     "handlebars": {exports: "Handlebars"}
     //"jquery.address": { exports: "address"}
     }
     });*/


// Load the main app module to start the app
//console.log("Loading SPAMD");
//requirejs([ "app/main"]);

});