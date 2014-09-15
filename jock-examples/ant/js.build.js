({
    appDir: "../src",
   baseUrl: "js/lib",
    dir: "../deploy",
    optimize: 'uglify',
    //optimize: 'none',
    removeCombined: true,
    skipDirOptimize: true,
    optimizeCss: 'standard',
    "mainConfigFile": "../src/js/config.js",
    paths: {
        "config": "../config",
        "requireLib": "require",
        "handlebars-runtime": "handlebars.runtime"
    },
    
    modules: [
        {
            name: "config",
            include: [
                "requireLib",
                "handlebars-runtime"
            ]
        }
    ],
    
    onBuildWrite: function( name, path, contents ) {
 
        if (name === 'handlebars') {
            return null;
        }
        if (name === "handlebars-runtime") {
            // Replace the AMD name 'handlebars-runtime' with just 'handlebars', otherwise handlebars dependencies will not find it
            // and attempt to download it again
            contents = contents.replace("define('handlebars-runtime'", "define('handlebars'");
            
            // Same thing as above but check for double quotes
            contents = contents.replace('define("handlebars-runtime"', 'define("handlebars"');
        }
        return contents;
    }
})
