
"use strict";
define(function(require) {
    require("jock/Jock");
    var $ = require('jquery');
    var dummyLib = require('../libs/dummylib');
    var viewManager = require("jock/view/view-manager");
    var API = require("app/views/api/API");


    var run = function() {
        module( "ViewManager API tests" );
            viewManager.init({target: "#qunit-fixture"});
        asyncTest('ViewManager.showView should add API to DOM successfully.', function() {

            viewManager.showView({view: API, animate: false}).then(function() {
                start();
                equal($("#toc").length, 1, 'DOM id #toc should be found.');
            });
        });

        asyncTest('ViewManager.clear should remove API from DOM successfully.', function() {

            viewManager.init({target: "#qunit-fixture"});
            viewManager.showView({view: API, animate: false}).then(function() {
                start();
                viewManager.empty("#qunit-fixture");
                equal($("#toc").length, 0, 'DOM id #toc should NOT be found.');
            });
        });
    };
    return {run: run};
});
