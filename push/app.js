// Place third party dependencies in the lib folder
//
// Configure loading modules from the lib directory,
// except 'app' ones, 
requirejs.config({
    "baseUrl": "../js/lib",
    "paths": {
        
    }
});

// Load the main app module to start the app
//requirejs(["spamd/spamd", "app/setup", "app/main"]);

requirejs(["spamd/history/history"], function(history) {
});

