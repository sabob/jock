"use strict";
require.config({
    "baseUrl": "../../js/lib",
    "paths": {
        'QUnit': '../tests/libs/qunit',
        "app": "../app",
        "test": "../tests",
        "hb": "spamd/hb",
        "moment": "moment",
        "numeral": "numeral"
    },
    shim: {
        "handlebars": {exports: "Handlebars"},
       'QUnit': {
           exports: 'QUnit',
           init: function() {
               QUnit.config.autoload = false;
               QUnit.config.autostart = false;
           }
       } 
    }
});

// require the unit tests.
define(function(require) {
        var QUnit = require("QUnit");
        var dummyTest = require( 'test/tests/dummyTest');
        var dummyTest2 = require( 'test/tests/dummyTest2');
        var ViewManagerTest = require( 'test/tests/ViewManagerTest');
        // run the tests.
        dummyTest.run();
        dummyTest2.run();
        ViewManagerTest.run();
        // start QUnit.
        QUnit.load();
        QUnit.start();
    }
);
